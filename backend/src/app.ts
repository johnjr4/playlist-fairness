// TODO: express setup with middleware, routes, error handling(?) and export app
import cors from 'cors';
import session from 'express-session';
import express from 'express';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import { DATABASE_URL, isProd, SESSION_SECRET, VITE_URLS } from './utils/envLoader.js';
import { errorHandler } from './utils/middleware/handleServerError.js';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

// Create main express app
const app = express();

if (isProd()) {
    app.set('trust proxy', 1);
}

console.log(`Configuring to use VITE_URLS: ${VITE_URLS}`);

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

const PgSession = connectPgSimple(session);
const pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isProd() ? {
        rejectUnauthorized: false, // Render requires this apparently
    } : false,
});

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
    },
    store: new PgSession({
        pool: pgPool,
        tableName: 'session',
        createTableIfMissing: true,
    }),
}));

// Require application/json request bodies
app.use(express.json());

app.use('/api', apiRouter);

app.use('/auth', authRouter);

app.use(errorHandler);

export default app;