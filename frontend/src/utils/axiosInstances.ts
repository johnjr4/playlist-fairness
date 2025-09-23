import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { BACKEND_URL } from "./envLoader";
import type { HTTPResponse } from "spotifair";

export const untypedBackendAxios = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const untypedBackendAuthAxios = axios.create({
    baseURL: `${BACKEND_URL}/auth`,
    withCredentials: true,
});

// Define the functions we expect of this axios instance
type TypedAxiosInstance = {
    get: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse>>;
    post: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse>>;
    put: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse>>;
    delete: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse>>;
}

function toTypedAxios(untyped: AxiosInstance): TypedAxiosInstance {
    return {
        get: (url, config) => untyped.get<HTTPResponse>(url, config),
        post: (url, data, config) => untyped.post<HTTPResponse>(url, data, config),
        put: (url, data, config) => untyped.put<HTTPResponse>(url, data, config),
        delete: (url, config) => untyped.delete<HTTPResponse>(url, config),
    }
}

export const backendAxios = toTypedAxios(untypedBackendAxios);
export const backendAuthAxios = toTypedAxios(untypedBackendAuthAxios);