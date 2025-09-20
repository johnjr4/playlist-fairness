import type { AxiosResponse } from "axios";
import type { HTTPResponse, HTTPResponseSuccess } from "spotifair";

export function isSuccess(res: AxiosResponse<HTTPResponse>): res is AxiosResponse<HTTPResponseSuccess> {
    const statusGood = res.status >= 200 && res.status <= 299;
    return statusGood && res.data.success;
}