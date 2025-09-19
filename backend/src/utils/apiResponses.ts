import type { HTTPResponseFailure, HTTPResponseSuccess } from "spotifair"

export function successfulResponse(message: string, data: any): HTTPResponseSuccess {
    return {
        success: true,
        message: message,
        data: data,
    }
}

export function errorResponse(message: string, code: string | null = null): HTTPResponseFailure {
    return {
        success: false,
        error: {
            message: message,
            code: code ?? undefined,
        }
    }
}