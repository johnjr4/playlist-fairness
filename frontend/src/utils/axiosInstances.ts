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
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse<T>>>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse<T>>>;
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse<T>>>;
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<HTTPResponse<T>>>;
}

function toTypedAxios(untyped: AxiosInstance): TypedAxiosInstance {
    return {
        get: <T>(url: string, config?: AxiosRequestConfig) => untyped.get<HTTPResponse<T>>(url, config),
        post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => untyped.post<HTTPResponse<T>>(url, data, config),
        put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => untyped.put<HTTPResponse<T>>(url, data, config),
        delete: <T>(url: string, config?: AxiosRequestConfig) => untyped.delete<HTTPResponse<T>>(url, config),
    }
}

export const backendAxios = toTypedAxios(untypedBackendAxios);
export const backendAuthAxios = toTypedAxios(untypedBackendAuthAxios);