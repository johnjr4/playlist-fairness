import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { validateIntId } from '../../utils/middleware/requireIdParam.js';
import { getAlbum, getAlbumFull } from '../../controllers/albumController.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { albumToPublic, albumToPublicFull } from '../../utils/types/frontendTypeMapper.js';
import { getUser } from '../../controllers/getFromDb.js';
import * as Public from 'spotifair';
import { getPlaylistCount, getTopPlaylist } from '../../controllers/playlistsController.js';
import { getTopTrack, getTrackCount } from '../../controllers/trackController.js';
import { getListeningHistory, getListeningHistoryStat } from '../../controllers/listeningEventController.js';
import { getUserStats } from '../../controllers/userController.js';

// Prefix will be '/user'
const router = express.Router();

// Return user
router.get('/',
    asyncHandler(async (req, res) => {
        const user = await getUser(req.session.user!.id);
        if (user) {
            res.json(successfulResponse(
                'Successfully got user',
                user
            ));
        } else {
            res.status(404).json(errorResponse(
                'User not found',
                'NOT_FOUND'
            ))
        }
    })
);

// Return stats for profile page
router.get('/stats',
    asyncHandler(async (req, res) => {
        const userStats = await getUserStats(req.session.user!.id);
        if (userStats) {
            res.json(successfulResponse(
                'Successfully got user stats',
                userStats
            ))
        } else {
            res.status(500).json(errorResponse(
                'Something went wrong getting user stats',
                'INTERNAL_SERVER_ERROR'
            ))
        }
    })
)

export default router;