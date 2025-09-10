// login and callback routes under the /auth URL suffix
import express from 'express';
import 'dotenv/config';
import axios from 'axios';
import { getCodeVerifier, codeChallengeFromVerifier } from '../utils/pkce.js';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '../utils/envLoader.js';
import { getSpotifyAxios, spotifyAuthAxios } from '../utils/axiosInstances.js';
import { createAndSyncUser } from '../controllers/syncSpotifyData.js';
import { getUserPlaylists } from '../controllers/getFromDb.js';

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
    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// TODO: Change this from something the spotify API calls to something the frontend calls with code (auth code) and code_verifier params
router.get('/callback', async (req, res) => {
    if (req.query.error) {
        // TODO: Obviously more sophisticated error handling
        console.log("Error getting authorization code");
        res.status(500).send('Failed to get Spotify authorization code');
    } else {
        const code = req.query.code! as string;
        const state = req.query.state! as string;

        if (state !== initialState) {
            // TODO: Better error handling
            console.log("State doesn't match initial state");
            res.status(500).send('State does not match');
        }

        try {
            const tokenResponse = await spotifyAuthAxios.post(
                '/api/token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: REDIRECT_URI,
                    client_id: CLIENT_ID,
                    code_verifier: codeVerifier,
                    client_secret: CLIENT_SECRET
                })
            );

            const { access_token, refresh_token, expires_in } = tokenResponse.data;

            // TODO: Store access tokens
            console.log(`Access token ${access_token}`);
            // const spotifyAxios = getSpotifyAxios(access_token);
            // const spotifyUser = await spotifyAxios.get('/me');
            const spotifyUser = await createAndSyncUser(access_token, refresh_token);
            const userPlaylists = await getUserPlaylists(spotifyUser.id);
            const hobbitPlaceholderUrl = "https://lh5.googleusercontent.com/proxy/iny1xEuggv0DZlJMsrXFAM0owcGuOcaKeQT4ZZirfjl_jPnVHF_UclZbdJeX1QI7B6y4f9ItMCAU9XAvp-vzhOiiq7ICDU89MIWBvU_iezcafVoCs3phh0ZozTRS5A3p0jEMHzTsy4wMfA";
            res.send(`
                <h2>Authorization successful!</h2>
                <p>Welcome ${spotifyUser.displayName}. You joined UnShuffle at ${spotifyUser.trackingStartTime}</p>
                <img src="${spotifyUser.imageUrl ? spotifyUser.imageUrl : hobbitPlaceholderUrl}">
                <ul>
                    ${userPlaylists.map(playlist => `<img src=${playlist.coverUrl ? playlist.coverUrl : hobbitPlaceholderUrl}><p>${playlist.name}</p>`).join('\n')}
                </ul>
            `);
        } catch (err) {
            console.error(err);
            res.status(500).send('Token exchange failed');
        }
    }
});

export default router;