// TODO: express setup with middleware, routes, error handling(?) and export app
import cors from 'cors';
import session from 'express-session';
import express from 'express';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import { isProd, SESSION_SECRET, VITE_URLS } from './utils/envLoader.js';
import { errorHandler } from './utils/middleware/handleServerError.js';

// Create main express app
const app = express();

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            callback(new Error('Empty origin not allowed by CORS'));
        } else if (VITE_URLS.indexOf(origin!) !== -1) {
            callback(null, true); // null just means no error
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));

app.use(session({
    name: 'spotifair.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProd(),
        httpOnly: true,
        sameSite: isProd() ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 5, // 5 hours
    }
}));

app.use('/api', apiRouter);

app.use('/auth', authRouter);

app.use(errorHandler);

export default app;