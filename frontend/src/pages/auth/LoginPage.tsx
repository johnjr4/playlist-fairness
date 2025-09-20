import LoginButton from "../../components/LoginButton";

function LoginPage() {
    // TODO: Calculate PKCE stuff, set CODE_VERIFIER_NAME sessionStorage, initiate OAuth by redirecting to Spotify
    return (
        <>
            <p>Auth login</p>
            <LoginButton />
        </>
    )
}

export default LoginPage;