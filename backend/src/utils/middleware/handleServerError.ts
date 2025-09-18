import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../apiResponses.js";

// Async catcher that passes errors to middleware when you wrap it around an express function
export function asyncHandler(
    asyncFn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return function (req: Request, res: Response, next: NextFunction) {
        Promise.resolve(asyncFn(req, res, next)).catch(next);
    }
}

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error("errorHandler caught express issue:", err);

    // Catch errors
    res.status(err.status ?? 500).json(
        errorResponse(
            err.message || "Internal server error",
        )
    );
}