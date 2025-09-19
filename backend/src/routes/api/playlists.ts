import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { getPlaylist, getPlaylistHist, getPlaylistWithTracks, getUserPlaylists } from '../../controllers/playlistsController.js';
import { playlistToPublic, playlistToPublicFull, playlistToPublicHist } from '../../utils/types/frontendTypeMapper.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { validateIntId } from '../../utils/middleware/requireIdParam.js';

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

export default router;