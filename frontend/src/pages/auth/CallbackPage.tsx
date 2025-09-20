import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../utils/AuthContext";
import { useEffect, useRef } from "react";
import { backendAxios } from "../../utils/axiosInstances";
import { type HTTPResponse, type HTTPResponseSuccess } from "spotifair";
import { deletePCKEVals, getPKCEVals } from "../../utils/pkce";
import { REDIRECT_URI } from "../../utils/envLoader";

function CallbackPage() {
    const [searchParams] = useSearchParams();
    const { user: stateUser, setUser, setLoading } = useAuth();
    // Will prevent error from double API call in StrictMode
    // TODO: Is this a hack?
    const hasRun = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Make sure this only runs once (even in StrictMode)
        if (hasRun.current) return;
        hasRun.current = true;
        // Set AuthProvider loading
        setLoading(true);

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const { verifier: codeVerifier, state: oldState } = getPKCEVals();

        if (!code || !state || !codeVerifier) {
            console.error("Missing code, state, or code verifier");
            // TODO: Not okay for error handling!
            navigate('/auth/login');
            return;
        }

        if (state !== oldState) {
            console.error("State does not match old state");
            // TODO: Not okay for error handling!
            navigate('/auth/login');
            return;
        }

        const backendCallbackRoute = `/auth/callback?code=${code}&state=${state}&verifier=${codeVerifier}&redirect=${REDIRECT_URI}`
        console.log(backendCallbackRoute);
        async function exchangeCode() {
            try {
                const authRes = await backendAxios.get<HTTPResponse>(backendCallbackRoute);

                if (authRes.status !== 200 && !authRes.data.success) {
                    console.error(authRes.data.error.message);
                    throw new Error("Failed to exchange authorization code");
                }
                console.log(authRes)
                const response = authRes.data as HTTPResponseSuccess;
                const user = response.data;

                // Set AuthProvider variables
                setUser(user);
                setLoading(false);

                // Clean up PKCE
                deletePCKEVals();

                // Navigate to protected routes
                navigate('/user');
            } catch (err) {
                console.error('Failed to authenticate user with backend', err);
                // TODO: This is not acceptable error handling!
                navigate('/auth/login');
            }
        }

        if (!stateUser) {
            console.log("Sending request!");
            exchangeCode();
        }
    }, []);

    return <p>Auth callback</p>
}

export default CallbackPage;