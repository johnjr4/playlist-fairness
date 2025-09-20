import 'dotenv/config'

export function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined!`);
    }
    return value;
}

export function isProd() {
    return NODE_ENV == 'prod'
        || NODE_ENV == 'production'
        || NODE_ENV == 'Prod'
        || NODE_ENV == 'Production';
}

export const DATABASE_URL = getEnv('DATABASE_URL');
export const SPOTIFY_CLIENT_ID = getEnv('SPOTIFY_CLIENT_ID');
export const SPOTIFY_CLIENT_SECRET = getEnv('SPOTIFY_CLIENT_SECRET');
// export const SPOTIFY_REDIRECT_URI = getEnv('SPOTIFY_REDIRECT_URI');
export const SPOTIFY_CONCURRENCY_LIMIT = parseInt(getEnv('SPOTIFY_CONCURRENCY_LIMIT'));
export const VITE_URLS = getEnv('VITE_URLS').split(',');
export const SESSION_SECRET = getEnv('SESSION_SECRET');
const NODE_ENV = getEnv('NODE_ENV');