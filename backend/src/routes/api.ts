// TODO: Consolidate all the routers in ./routes/api under the general /api URL suffix
import express, { type NextFunction, type Request, type Response } from 'express';
import prisma from '../utils/prismaClient.js';
import { getPlaylistTracksWithHistory, getUser, getUserPlaylists } from '../controllers/getFromDb.js';

const router = express.Router();

function requrieAuth(req: Request, res: Response, next: NextFunction) {
    console.log(`Session grabbed ${req.session.id}`);
    if (req.session && req.session.user) {
        return next(); // User is authenticated
    }
    return res.status(401).json({ error: 'Unauthorized' });
}

// Apply requireAuth middleware to all the following api routes
router.use(requrieAuth);

router.get('/me', async (req, res) => {
    const user = await getUser(req.session.user!.id);

    res.json(user);
})

router.get('/test-print', async (req, res) => {
    const user = await getUser(req.session.user!.id);

    if (!user) {
        res.send('User does not exist in database');
    } else {
        const userPlaylists = await getUserPlaylists(user.id);
        let nestedPlaylists = [];
        for (const playlist of userPlaylists) {
            const tracklist = await getPlaylistTracksWithHistory(playlist.id);
            nestedPlaylists.push({
                playlist: playlist,
                tracklist: tracklist,
            })
        }
        const hobbitPlaceholderUrl = "https://lh5.googleusercontent.com/proxy/iny1xEuggv0DZlJMsrXFAM0owcGuOcaKeQT4ZZirfjl_jPnVHF_UclZbdJeX1QI7B6y4f9ItMCAU9XAvp-vzhOiiq7ICDU89MIWBvU_iezcafVoCs3phh0ZozTRS5A3p0jEMHzTsy4wMfA";
        res.send(`
            <h2>Authorization successful!</h2>
            <p>Welcome ${user.displayName}. You joined UnShuffle at ${user.trackingStartTime}</p>
            <img src="${user.imageUrl ? user.imageUrl : hobbitPlaceholderUrl}">
            <ul>
                ${nestedPlaylists.map(p => `<img src=${p.playlist.coverUrl ? p.playlist.coverUrl : hobbitPlaceholderUrl}><p>${p.playlist.name}: ${p.tracklist ? p.tracklist.length : 0} tracks</p><ul>
                        ${p.tracklist?.map(el => `<li>${el.track.name}${el.currentlyOnPlaylist ? "" : " REMOVED"} - ${el.listeningEvents.length} plays</li>`).join('')}
                    </ul>`).join('\n')}
            </ul>
        `);
    }

})

export default router;