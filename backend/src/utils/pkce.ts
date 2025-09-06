import crypto from 'crypto';

export function getCodeVerifier(): string {
    return crypto.randomBytes(64).toString('hex');
}

export function codeChallengeFromVerifier(codeVerifier: string): string {
    return crypto
        .createHash('sha256') // Creates an object capable of hashing
        .update(codeVerifier) // Sets the "input" value
        .digest() // returns the "output" value
        .toString('base64') // Most convert from binary (SHA's domain) back to base64 for URL
        .replace(/[+]/g, '-') // Replace global (all) instances of '+' (not URL safe)
        .replace(/[/]/g, '_') // Replace global (all) instances of '/' (not URL safe)
        .replace(/=+$/, ''); // Replace 1 or more ='s immediately preceding string end ($) because that's padding
}