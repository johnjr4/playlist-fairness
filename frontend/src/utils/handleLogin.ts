import { getAuthServerUrl } from "./auth/initiateOAuth";
import { createNewPKCE, setPKCEVals } from "./pkce";

export async function handleLogin() {
    // Initiate PKCE
    const { verifier, challenge, state } = await createNewPKCE();
    setPKCEVals(verifier, state);
    // Get auth server URL (with parameters)
    const spotifyAuthUrl = getAuthServerUrl(challenge, state);
    // Navigate to it
    window.location.href = spotifyAuthUrl;
}