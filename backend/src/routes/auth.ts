// login and callback routes under the /auth URL suffix
import express, { type Request } from 'express';
import 'dotenv/config';
import { getCodeVerifier, codeChallengeFromVerifier } from '../utils/pkce.js';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '../utils/envLoader.js';
import { spotifyAuthAxios } from '../utils/axiosInstances.js';
import { createAndSyncUser } from '../controllers/syncSpotifyData.js';
import type { AuthCallbackReqQuery } from '../utils/types/helperTypes.js';

const router = express.Router();

const CLIENT_ID = SPOTIFY_CLIENT_ID
const CLIENT_SECRET = SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = SPOTIFY_REDIRECT_URI
const SCOPES = ['user-library-read', 'playlist-read-private', 'user-read-recently-played'].join(' ');


// TODO: Remove, this should be frontend
let codeVerifier: string;
let initialState: string;

router.get('/login', (req, res) => {
    // TODO: Replace all of this. PKCE should be on the frontend
    codeVerifier = getCodeVerifier();
    initialState = 'booyah'; // Change this obviously
    let codeChallenge = codeChallengeFromVerifier(codeVerifier);
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state: initialState,
        scope: SCOPES,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });
    // res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
    res.send(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// TODO: This should also be frontend
router.get('/debug_callback', async (req, res) => {
    if (req.query.error) {
        // TODO: Obviously more sophisticated error handling
        console.log("Error getting authorization code from Spotify");
        res.status(500).send('Failed to get Spotify authorization code');
        return;
    }
    const url = `http://localhost:3000/auth/callback?code=${req.query.code}&state=${req.query.state}&verifier=${codeVerifier}`;
    res.send(url);
})

// TODO: Change this from something the spotify API calls to something the frontend calls with code (auth code) and code_verifier params
router.get('/callback', async (req: Request<{}, any, any, AuthCallbackReqQuery>, res) => {
    const { code, state, verifier } = req.query;

    if (!code || !state || !verifier) {
        res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message: "Didn't provide all of necessary OAuth parameters",
            }
        });
        return;
    }

    if (state !== initialState) {
        // TODO: Better error handling
        console.log("State doesn't match initial state");
        res.status(500).send('State does not match');
        return;
    }

    try {
        const tokenResponse = await spotifyAuthAxios.post(
            '/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code!,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                code_verifier: verifier!,
                client_secret: CLIENT_SECRET
            })
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // TODO: Store access tokens
        console.log(`Access token ${access_token}`);
        console.log(`Refresh token ${refresh_token}`);
        // TODO: get rid of terrible server-side rendering in the auth callback for goodness sake
        const user = await createAndSyncUser(access_token, refresh_token);
        req.session.user = { id: user.id, spotifyUri: user.spotifyUri };
        console.log(`Session saved ${req.session.id}`);

        res.send('User authenticated');
    } catch (err) {
        console.error(err);
        res.status(500).send('Token exchange failed');
    }
});

export default router;