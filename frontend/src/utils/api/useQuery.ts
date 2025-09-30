import * as React from "react"
import { backendAxios } from "../axiosInstances";
import { isSuccess } from "../resParser";
import type { HTTPResponseFailure } from "spotifair";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

// Adapted from https://ui.dev/why-react-query (next time I'll use React Query)
// Handy query hook for my backend specifically
export default function useQuery(path: string, dependencies = []) {
    const [data, setData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);


    const handleFetch = async (signal: AbortSignal) => {
        setData(null);
        setIsLoading(true);
        setError(null);

        try {
            // Make request
            const res = await backendAxios.get(path, { signal: signal });

            if (!isSuccess(res)) {
                // Manual type narrowing after isSuccess failed
                const errRes = res as AxiosResponse<HTTPResponseFailure>;
                throw new Error(errRes.data.error.message);
            }
            // Successful response means this is our data
            const apiData = res.data.data;
            setData(apiData);
            // Set error to null in case there was a previous error in a race condition
            // TODO: Removed this because it seemed like a hacky solution to ignoring setIsLoading on canceled, but should it be here as a safeguard anyway?
            // setError(null);
            setIsLoading(false);
        } catch (e) {
            if (axios.isCancel(e)) {
                // *don't* set error because we want to treat this more like loading
                // canceling only happens right before another request or unmount. The user doesn't need to know
            }
            else {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Unknown error");
                }
                setIsLoading(false);
            }
        }
    }

    React.useEffect(() => {
        const controller = new AbortController();
        let ignore = false;



        async function run() {
            try {
                await handleFetch(controller.signal);
            } catch (err) {
                if (!ignore) {
                    setError("Error in run()");
                }
            }
        }

        run();

        return () => {
            // Clean up and ignore in-flight requests
            ignore = true
            controller.abort();
        }
    }, [path, ...dependencies])

    return { data, isLoading, error, refetch: () => handleFetch(new AbortController().signal), }
}

// Handy query hook for queries not to my backend
export function useQueryGeneric(url: string | null, config: AxiosRequestConfig = {}) {
    const [data, setData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);


    React.useEffect(() => {
        const controller = new AbortController();
        let ignore = false;

        const handleFetch = async () => {

            setData(null);
            setIsLoading(true);
            setError(null);

            try {
                if (url === null) {
                    setData(null);
                    setIsLoading(false);
                    throw new Error("URL Is null");
                }
                // Make request
                const fullConfig = {
                    ...config,
                    signal: controller.signal,
                }
                const res = await axios.get(url, fullConfig);

                // Ignore request if cleaned up
                if (ignore) {
                    return;
                }

                // TODO: Do a more thorough status check
                if (!(res.status >= 200 && res.status <= 299)) {
                    const errRes = res.data;
                    throw new Error(`Unsuccessful response of code ${errRes.status}`);
                }

                // Successful response means this is our data
                setData(res.data);
                // Set error to null in case there was a previous error in a race condition
                // TODO: Removed this because it seemed like a hacky solution to ignoring setIsLoading on canceled, but should it be here as a safeguard anyway?
                // setError(null);
            } catch (e) {
                if (axios.isCancel(e)) {
                    // *don't* set error because we want to treat this more like loading
                    // canceling only happens right before another request or unmount. The user doesn't need to know
                }
                else if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Unknown error");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        handleFetch();

        return () => {
            // Clean up and ignore in-flight requests
            ignore = true
            controller.abort();
        }
    }, [url])

    return { data, isLoading, error }
}