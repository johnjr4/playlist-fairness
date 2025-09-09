import axios from "axios";

export function getSpotifyAxios(accessToken: string) {
    return axios.create({
        baseURL: 'https://api.spotify.com/v1',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export const spotifyAuthAxios = axios.create({
    baseURL: 'https://accounts.spotify.com',
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    }
})