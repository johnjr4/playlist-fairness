import axios, { AxiosError, type AxiosInstance } from "axios";

export function getSpotifyAxios(accessToken: string): AxiosInstance {
    const spotifyAxios = axios.create({
        baseURL: 'https://api.spotify.com/v1',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    spotifyAxios.interceptors.response.use(
        response => response,
        async error => {
            const { response, config } = error;
            const SPOTIFY_RATE_LIMIT_CODE = 429;

            if (!response || response.status !== SPOTIFY_RATE_LIMIT_CODE || !config) {
                // Not the right kind of error, no use in retrying
                return Promise.reject(error);
            }

            // Avoid infinite retry loops
            config._retryCount = config._retryCount ?? 0;
            if (config._retryCount >= 3) {
                console.error(`Failed ${config._retryCount} retries to Spotify, abandoning request`);
                return Promise.reject(error);
            }
            config._retryCount += 1;

            // Actually retry
            const retryAfter = parseInt(response.headers['Retry-After'], 10) || 1;
            const delayMs = retryAfter * 1000;

            console.warn(`Rate limited by Spotify. Retrying after ${delayMs}ms... (attempt ${config._retryCount})`);

            // Wait for delayMs ms
            await new Promise(resolve => setTimeout(resolve, delayMs));

            return spotifyAxios(config);
        });
    return spotifyAxios;
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

async function axiosRateLimitRetry(error: AxiosError) {

}