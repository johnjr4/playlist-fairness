// login and callback routes under the /auth URL suffix
import express from 'express';
import 'dotenv/config';
import axios from 'axios';
import { getCodeVerifier, codeChallengeFromVerifier } from '../utils/pkce.js';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '../utils/envLoader.js';

const router = express.Router();

const CLIENT_ID = SPOTIFY_CLIENT_ID
const CLIENT_SECRET = SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = SPOTIFY_REDIRECT_URI
const SCOPES = ['user-read-currently-playing', 'playlist-read-private', 'playlist-read-collaborative', 'user-read-recently-played'].join(' ');


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
        console.log(`auth code: ${code}`)

        if (state !== initialState) {
            // TODO: Better error handling
            console.log("State doesn't match initial state");
            res.status(500).send('State does not match');
        }

        try {
            const authCombination = `${CLIENT_ID}:${CLIENT_SECRET}`;
            const tokenResponse = await axios.post(
                `https://accounts.spotify.com/api/token`,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: REDIRECT_URI,
                    client_id: CLIENT_ID,
                    code_verifier: codeVerifier,
                    client_secret: CLIENT_SECRET
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                })

            const { access_token, refresh_token, expires_in } = tokenResponse.data;
            
            // TODO: Store access tokens
            
            const spotifyUser = await axios.get(
                `https://api.spotify.com/v1/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                    }
                }
            )

            const { display_name, country } = spotifyUser.data; 

            res.send(`
                <h2>Authorization successful!</h2>
                <p>Welcome ${display_name} from ${country}</p>
                `);
        } catch (err) {
            console.error(err);
            res.status(500).send('Token exchange failed');
        }
    }
});

export default router;