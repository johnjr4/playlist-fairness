export function successfulResponse(message: string, data: any) {
    return {
        success: true,
        message: message,
        data: data,
    }
}

export function errorResponse(message: string, code: string | null = null) {
    return {
        success: false,
        error: {
            message: message,
            code: code ?? undefined,
        }
    }
}