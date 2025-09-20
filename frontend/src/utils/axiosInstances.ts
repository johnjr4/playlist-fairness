import axios from "axios";
import { BACKEND_URL } from "./envLoader";

export const backendAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});