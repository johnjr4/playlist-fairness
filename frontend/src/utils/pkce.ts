// From Spotify's Authorization code PKCE
function generateRandomString(length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain); // Get array of Uint8 types instead of finicky JavaScript strings
    return await crypto.subtle.digest("SHA-256", data);
}

function base64encode(input: ArrayBuffer) {
    // btoa creates ASCII-encoded string (every char is 2 bytes)
    // String.fromCharCode turns our array into a JavaScript string
    // new Uint8Array is because we're passing in an ArrayBuffer (just a collection of bytes), so we need a data view
    return btoa(String.fromCharCode(... new Uint8Array(input)))
        .replace(/[+]/g, '-') // Replace global (all) instances of '+' (not URL safe)
        .replace(/[/]/g, '_') // Replace global (all) instances of '/' (not URL safe)
        .replace(/=+$/, ''); // Replace 1 or more ='s immediately preceding string end ($) because that's padding

}

export function getCodeVerifier(): string {
    return generateRandomString(64);
}

export async function getCodeChallengeFromVerifier(verifier: string) {
    const hashed = await sha256(verifier);
    return base64encode(hashed);
}

export async function createNewPKCE() {
    const verifier = getCodeVerifier();
    const challenge = await getCodeChallengeFromVerifier(verifier);
    const state = crypto.randomUUID();
    return { verifier, challenge, state }
}

const codeVerifierStorageName = 'PKCE_code_verifier';
const stateStorageName = 'PKCE_state';

export function setPKCEVals(verifier: string, state: string) {
    sessionStorage.setItem(codeVerifierStorageName, verifier);
    sessionStorage.setItem(stateStorageName, state);
}

export function getPKCEVals() {
    return {
        verifier: sessionStorage.getItem(codeVerifierStorageName),
        state: sessionStorage.getItem(stateStorageName),
    }
}

export async function deletePCKEVals() {
    sessionStorage.removeItem(codeVerifierStorageName);
    sessionStorage.removeItem(stateStorageName);
}