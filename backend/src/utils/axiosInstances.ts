import axios, { AxiosError } from "axios";

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
});

export function handleAxiosError(err: AxiosError) {
    if (err.response) {
        console.error("Response error");
        console.log(err.response.data);
        console.log(err.response.status);
        console.log(err.response.headers);
    } else if (err.request) {
        console.error("Request error");
        console.log(err.request);
    } else {
        console.error("Unknown axios error");
        console.log(err.message);
    }
}