import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { getPlaylist, getUserPlaylists } from '../../controllers/getFromDb.js';
import { playlistToPublic } from '../../utils/types/frontendTypeMapper.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';

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

router.get('/:id',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylist(playlistId, false, req.session.user!.id);
        if (playlist) {
            res.json(successfulResponse(
                `Playlist ${playlistId} fetched successfully`,
                playlist,
            ));
        } else {
            res.status(404).json(errorResponse(
                `Playlist ${playlistId} not found for user ${req.session.user!.spotifyUri}`,
                'NOT_FOUND'
            ))
        }
    })
);

router.get('/:id/full',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylist(playlistId, true, req.session.user!.spotifyUri);
        if (playlist) {
            res.json(successfulResponse(
                `Playlist ${playlistId} fetched successfully`,
                playlist
            ));
        } else {
            res.status(404).json(errorResponse(
                `Playlist ${playlistId} not found for user ${req.session.user!.id}`,
                'NOT_FOUND'
            ))
        }
    })
);

export default router;