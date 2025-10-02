import type { AxiosResponse } from "axios";
import type { HTTPResponse, HTTPResponseSuccess } from "spotifair";

export function isSuccess<T>(res: AxiosResponse<HTTPResponse<T>>): res is AxiosResponse<HTTPResponseSuccess<T>> {
    const statusGood = res.status >= 200 && res.status <= 299;
    return statusGood && res.data.success;
}