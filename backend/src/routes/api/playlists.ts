import express, { type Request } from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { setPlaylistSync, getPlaylist, getPlaylistHist, getPlaylistWithTracks, getUserPlaylists } from '../../controllers/playlistsController.js';
import { playlistToPublic, playlistToPublicFull, playlistToPublicHist } from '../../utils/types/frontendTypeMapper.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { validateIntId } from '../../utils/middleware/requireIdParam.js';
import { getUser } from '../../controllers/getFromDb.js';
import { disableAndDeletePlaylistSync } from '../../controllers/syncSpotifyData.js';
import type { PlaylistSyncBody, PlaylistSyncRes } from 'spotifair';

// Prefix will be '/playlists'
const router = express.Router();

router.get('/',
    asyncHandler(async (req, res) => {
        const playlists = await getUserPlaylists(req.session.user!.id);
        res.json(successfulResponse(
            "Playlists fetched successfully",
            playlists.map(p => playlistToPublic(p))
        ));
    })
);

// Parameter middleware to validate int id
router.param('id', validateIntId);

router.get('/:id',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylist(playlistId, req.session.user!.id);
        if (playlist) {
            res.json(successfulResponse(
                `Playlist ${playlistId} fetched successfully`,
                playlistToPublic(playlist)
            ));
        } else {
            res.status(404).json(errorResponse(
                `Playlist ${playlistId} not found for user ${req.session.user!.spotifyUri}`,
                'NOT_FOUND'
            ))
        }
    })
);

router.get('/:id/tracks',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylistWithTracks(playlistId, req.session.user!.id);
        if (playlist) {
            res.json(successfulResponse(
                `Playlist ${playlistId} fetched successfully`,
                playlistToPublicFull(playlist)
            ));
        } else {
            res.status(404).json(errorResponse(
                `Playlist ${playlistId} not found for user ${req.session.user!.id}`,
                'NOT_FOUND'
            ))
        }
    })
);

router.get('/:id/tracks/hist',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylistHist(playlistId, req.session.user!.id);
        if (playlist) {
            res.json(successfulResponse(
                `Playlist ${playlistId} fetched successfully`,
                playlistToPublicHist(playlist)
            ));
        } else {
            res.status(404).json(errorResponse(
                `Playlist ${playlistId} not found for user ${req.session.user!.id}`,
                'NOT_FOUND'
            ))
        }
    })
);

router.post('/:id/sync',
    asyncHandler(async (req: Request<{ id?: string }, PlaylistSyncRes, PlaylistSyncBody>, res) => {
        const enabled = req.body.enabled;
        if (enabled === undefined || enabled === null || typeof enabled !== 'boolean') {
            res.status(400).json(errorResponse(
                'Field \'enabled\' not properly formatted',
                'BAD_REQUEST'
            ))
            return;
        }
        const playlistId = parseInt(req.params.id!);
        const user = await getUser(req.session.user!.id);
        if (!user) {
            res.status(500).json(errorResponse(
                'Error getting user',
                'INTERNAL_SERVER_ERROR'
            ))
            return;
        }
        const playlistSyncRes = await setPlaylistSync(playlistId, user, enabled);
        if (playlistSyncRes) {
            res.json(successfulResponse(
                `Playlist sync updated successfully`,
                playlistSyncRes,
            ));
        } else {
            res.status(500).json(errorResponse(
                `Playlist sync failed to update`,
                'INTERNAL_SERVER_ERROR'
            ))
        }
    })
)

export default router;