import * as React from "react"
import { backendAxios } from "../axiosInstances";
import { isSuccess } from "../resParser";
import type { HTTPResponseFailure } from "spotifair";
import type { AxiosResponse } from "axios";
import axios from "axios";

// Adapted from https://ui.dev/why-react-query (next time I'll use React Query)

export default function useQuery(path: string) {
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
                // Make request
                console.log(`Querying ${path}`)
                const res = await backendAxios.get(path, { signal: controller.signal });

                // Ignore request if cleaned up
                if (ignore) {
                    return;
                }

                if (!isSuccess(res)) {
                    // Manual type narrowing after isSuccess failed
                    const errRes = res as AxiosResponse<HTTPResponseFailure>;
                    throw new Error(errRes.data.error.message);
                }
                // Successful response means this is our data
                const apiData = await res.data.data;
                setData(apiData);
                // Set error to null in case there was a previous error in a race condition
                // TODO: Removed this because it seemed like a hacky solution to ignoring setIsLoading on canceled, but should it be here as a safeguard anyway?
                // setError(null);
            } catch (e) {
                console.log("Setting error");
                if (axios.isCancel(e)) {
                    console.log("Request canceled");
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
            console.log("Canceling request")
            ignore = true
            controller.abort();
        }
    }, [path])

    return { data, isLoading, error }
}
