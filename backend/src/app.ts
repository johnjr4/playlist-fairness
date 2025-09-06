// TODO: express setup with middleware, routes, error handling(?) and export app
import express from 'express';
import authRouter from './routes/auth.js';

// Create main express app
const app = express();

app.use('/auth', authRouter);

export default app;