import Button from "./ui/Button";
import { createNewPKCE, setPKCEVals } from "../utils/pkce";
import { getAuthServerUrl } from "../utils/auth/initiateOAuth";
import { useAuth } from "../utils/AuthContext";

function LoginButton() {
    const { user } = useAuth();
    let isLoggedIn = false;
    if (user) {
        isLoggedIn = true;
    }

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
        <Button onClick={isLoggedIn ? undefined : handleLogin} variant={isLoggedIn ? 'secondary' : 'primary'}>
            {isLoggedIn ? 'Logged In' : 'Log In'}
        </Button>
    )
}

export default LoginButton;