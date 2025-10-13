import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../utils/AuthContext";
import { useEffect, useRef, useState } from "react";
import { backendAuthAxios } from "../../utils/axiosInstances";
import type * as Public from "spotifair";
import { deletePCKEVals, getPKCEVals } from "../../utils/pkce";
import { REDIRECT_URI } from "../../utils/envLoader";
import { ScaleLoader } from "react-spinners";
import loadingClasses from '../../styling/loading.module.css';
import Button from "../../components/ui/Button";
import { handleLogin } from "../../utils/handleLogin";
import { isSuccess } from "../../utils/resParser";
import type { AxiosResponse } from "axios";

interface CallbackError {
    message: string,
}

function CallbackPage() {
    const [searchParams] = useSearchParams();
    const { user: stateUser, setUser, setLoading } = useAuth();
    const [error, setError] = useState<CallbackError | null>(null); // TODO: Replace with typed object and display error that went wrong
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
            setError({
                message: "Missing OAuth query parameters"
            });
        } else if (state !== oldState) {
            console.error("State does not match old state");
            setError({
                message: "Incorrect OAuth state"
            });
        } else {
            // Construct backend route
            const backendCallbackRoute = `/callback?code=${code}&state=${state}&verifier=${codeVerifier}&redirect=${REDIRECT_URI}`
            async function exchangeCode() {
                try {
                    // Query backend
                    const authRes = await backendAuthAxios.get<Public.User>(backendCallbackRoute);
                    // Check success
                    if (!isSuccess(authRes)) {
                        const errRes = authRes as AxiosResponse<Public.HTTPResponseFailure>;
                        console.error(errRes.data.error.message);
                        throw new Error("Failed to exchange authorization code");
                    }
                    // Get user from response
                    const user = authRes.data.data;

                    // Set AuthProvider variables
                    setUser(user);
                    setLoading(false);

                    // Clean up PKCE
                    deletePCKEVals();

                    // Navigate to protected routes
                    navigate('/u/playlists');
                } catch (err) {
                    console.error('Failed to authenticate user with backend', err);
                    setError({
                        message: "Failed to authenticate user with backend"
                    })
                }
            }

            if (!stateUser) {
                exchangeCode();
            }
        }

    }, []);

    // Set error or regular content
    let content;
    if (!error) {
        content = (
            <>
                <p className="text-base lg:text-lg">Syncing your Spotify Playlists</p>
                <div className="p-2 text-center flex justify-center">
                    <ScaleLoader color="var(--color-textPrimary)" height={12} barCount={10} radius={5} speedMultiplier={1.2} />
                </div>
                <p className={`text-sm lg:text-base ${loadingClasses['fade-in']}`}>
                    This may take a while
                </p>
            </>
        );
    } else {
        // Error found
        content = (
            <>
                <div className="text-center flex flex-col gap-1">
                    <h2 className="text-xl lg:text-3xl font-semibold">Sorry, something went wrong</h2>
                    <p className="text-sm lg:text-base text-background-50">Error: {error.message}</p>
                </div>
                <Button onClick={() => handleLogin()} useDefaultSizing={true}>
                    Try again
                </Button>
            </>
        )
    }


    return (
        <div className="flex flex-col justify-center items-center gap-3">
            {content}
        </div>
    );
}

export default CallbackPage;