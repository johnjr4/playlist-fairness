import Button from "./ui/Button";
import { createNewPKCE, setPKCEVals } from "../utils/pkce";
import { getAuthServerUrl } from "../utils/auth/initiateOAuth";

function LoginButton() {
    async function handleLogin() {
        // Initiate PKCE
        const { verifier, challenge, state } = await createNewPKCE();
        setPKCEVals(verifier, state);
        // Get auth server URL (with parameters)
        const spotifyAuthUrl = getAuthServerUrl(challenge, state);
        // Navigate to it
        window.location.href = spotifyAuthUrl;
    }

    return (
        <Button onClick={handleLogin}>
            Login
        </Button>
    )
}

export default LoginButton;