// login and callback routes under the /auth URL suffix
import express, { type Request } from 'express';
import 'dotenv/config';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../utils/envLoader.js';
import { spotifyAuthAxios } from '../utils/axiosInstances.js';
import { createAndSyncUser, upsertUserAndPlaylists } from '../controllers/syncSpotifyData.js';
import type { AuthCallbackReqQuery } from '../utils/types/helperTypes.js';
import { errorResponse, successfulResponse } from '../utils/apiResponses.js';
import { userToPublic } from '../utils/types/frontendTypeMapper.js';
import requrieAuth from '../utils/middleware/requireAuth.js';
import { getUser } from '../controllers/getFromDb.js';

const router = express.Router();

const CLIENT_ID = SPOTIFY_CLIENT_ID
const CLIENT_SECRET = SPOTIFY_CLIENT_SECRET;

// 
/**
 * Receives intermediate call from frontend to exchange for access code from Spotify Authorization server
 * 
 * front makes PKCE -> front qs Spot -> Spot redirs to front -> front qs back w PKCE -> back qs Spot -> Spot sends back access_token
 *                                                                                           ^
 *                                                                                           |
 *                                                                                      you are here
 */
router.get('/callback', async (req: Request<{}, any, any, AuthCallbackReqQuery>, res) => {
    const { code, state, verifier, redirect } = req.query;

    if (!code || !state || !verifier || !redirect) {
        res.status(400).json(
            errorResponse(
                "Didn't provide all necessary OAuth parameters",
                "BAD_REQUEST"
            )
        );
        return;
    }

    try {
        const tokenResponse = await spotifyAuthAxios.post(
            '/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code!,
                redirect_uri: redirect,
                client_id: CLIENT_ID,
                code_verifier: verifier!,
                client_secret: CLIENT_SECRET
            })
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // console.log(`Access token ${access_token}`);
        // console.log(`Refresh token ${refresh_token}`);
        const user = await upsertUserAndPlaylists(access_token, refresh_token);
        req.session.user = { id: user.id, spotifyUri: user.spotifyUri };
        console.log(`Session saved ${req.session.id}`);
        console.log(`Sending response with headers:`);
        console.log(res.getHeaders())

        res.json(
            successfulResponse(
                "User authenticated",
                userToPublic(user),
            )
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(
            errorResponse(
                "Token exchange failed",
                "INTERNAL_SERVICE_ERROR"
            )
        )
    }
});

// Return user if the passed cookie is valid (i.e., a session exists)
// require existing user in session with middleware
router.use(requrieAuth);
router.get('/check-session', async (req, res) => {
    const user = await getUser(req.session.user!.id);
    if (user) {
        res.json(
            successfulResponse(
                "Successfully found current user",
                userToPublic(user),
            )
        )
    } else {
        res.status(404).json(
            errorResponse(
                "User not found for existing session. Try re-authenticating",
                "NOT_FOUND",
            )
        )
    }
})

// Delete user session
// Requires existing user in session with middleware
router.post('/logout', async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json(errorResponse(
                'Failed to log out',
                'INTERNAL_SERVER_ERROR'
            ))
        } else {
            res.clearCookie('spotifair.sid');
            return res.json(successfulResponse(
                'Successfully logged out',
                null
            ))
        }
    });
})

export default router;