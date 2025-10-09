import { REDIRECT_URI, SPOTIFY_CLIENT_ID } from "../envLoader";

const scopes = ['user-library-read', 'playlist-read-private', 'user-read-recently-played', 'user-read-private'].join(' ');

export function getAuthServerUrl(codeChallenge: string, state: string) {
    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: scopes,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}