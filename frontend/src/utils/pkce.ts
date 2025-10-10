import { sha256 } from "@noble/hashes/sha2.js";
import { randomBytes } from "@noble/hashes/utils.js";

// From Spotify's Authorization code PKCE
function generateRandomString(length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = randomBytes(length);
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function getSha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain); // Get array of Uint8 types instead of finicky JavaScript strings
    return sha256(data);
}

function base64encode(input: Uint8Array) {
    // btoa creates ASCII-encoded string (every char is 2 bytes)
    // String.fromCharCode turns our array into a JavaScript string
    // new Uint8Array is because we're passing in an ArrayBuffer (just a collection of bytes), so we need a data view
    // (Since switching to noble hashes, we actually are passing in Uint8Array, but I kept the above comment for posterity)
    return btoa(String.fromCharCode(...(input)))
        .replace(/[+]/g, '-') // Replace global (all) instances of '+' (not URL safe)
        .replace(/[/]/g, '_') // Replace global (all) instances of '/' (not URL safe)
        .replace(/=+$/, ''); // Replace 1 or more ='s immediately preceding string end ($) because that's padding

}

export function getCodeVerifier(): string {
    return generateRandomString(64);
}

export async function getCodeChallengeFromVerifier(verifier: string) {
    const hashed = await getSha256(verifier);
    return base64encode(hashed);
}

export async function createNewPKCE() {
    const verifier = getCodeVerifier();
    const challenge = await getCodeChallengeFromVerifier(verifier);
    const state = base64encode(randomBytes(32));
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