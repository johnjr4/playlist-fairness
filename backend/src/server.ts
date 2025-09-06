// TODO: import app from app.ts, get port, and start app.listen

import express from 'express';
import app from './app.js';
import 'dotenv/config';

console.log("Hello world! And hello backend");

// Deployment platform typically sets PORT dynamically as env var, so 3000 is dev fallback
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello world!');
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});