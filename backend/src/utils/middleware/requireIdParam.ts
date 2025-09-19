import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../apiResponses.js";

export function validateIntId(req: Request, res: Response, next: NextFunction, val: number) {
    if (isNaN(val)) {
        res.status(400).json(errorResponse(
            `Malformed int id ${val}`,
            'BAD_REQUEST'
        ));
        return;
    }
    next();
}

export function validateUserUuid(req: Request, res: Response, next: NextFunction, val: string) {
    if (typeof val !== 'string') {
        res.status(400).json(errorResponse(
            `Malformed uuid ${val}`,
            'BAD_REQUEST'
        ));
        return;
    }
    next();
}