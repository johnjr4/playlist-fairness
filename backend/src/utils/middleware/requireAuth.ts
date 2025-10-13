import type { NextFunction, Request, Response } from 'express';
import { getUser } from '../../controllers/getFromDb.js';
import { errorResponse } from '../apiResponses.js';

export default function requrieAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.user) {
        return next(); // User is authenticated
    }
    console.error(`User session not found for ${req.url} from ${req.ip}. Cookies were ${req.cookies}`);
    return res.status(401).json(
        errorResponse(
            "Route requires user authentication",
            "UNAUTHORIZED"
        )
    );
}

// Assume that this appears after requireAuth
export async function requireUser(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.user) {
        console.warn("No valid user id in session. Did you forget to use requireAuth?");
        return next();
    }

    try {
        const userId = req.session.user!.id;
        const user = await getUser(userId);
        if (!user) {
            console.warn("User not found in database for requireUser");
            return next();
        }

        req.user = user;
        return next();
    } catch (err) {
        return next(err);
    }
}