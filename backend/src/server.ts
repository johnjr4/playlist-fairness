// TODO: import app from app.ts, get port, and start app.listen

import app from './app.js';
import 'dotenv/config';
import { startPollingHistory, stopPollingHistory } from './controllers/pollSpotifyHistory.js';
console.log("Hello world! And hello backend");

// Deployment platform typically sets PORT dynamically as env var, so 3000 is dev fallback
const port = process.env.PORT || 3000;

const pollTask = startPollingHistory();

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// process.on("SIGINT", handleCleanup);
// process.on("SIGTERM", handleCleanup);

// async function handleCleanup() {
//     console.log("Shutting down server");
//     server.close(() => {
//         handleCronCleanup()
//             .then(() => {
//                 console.log("Graceful exit complete");
//                 process.exit(0);
//             })
//             .catch(err => {
//                 console.error("Failed to gracefully exit:", err);
//                 process.exit(1);
//             });
//     })
// }

// async function handleCronCleanup() {
//     console.log("Stopping and destroying poll task");
//     stopPollingHistory()
//         .then(() => {
//             console.log('Poll task destroyed');
//         })
//         .catch(err => {
//             console.error('Failed to clean up poll task:', err);
//             throw err;
//         });
// }