export function getEnv(name: string): string {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined!`);
    }
    return value;
}

export const BACKEND_URL = getEnv('VITE_BACKEND_URL');
export const SPOTIFY_CLIENT_ID = getEnv('VITE_SPOTIFY_CLIENT_ID');
export const REDIRECT_URI = getEnv('VITE_REDIRECT_URI');