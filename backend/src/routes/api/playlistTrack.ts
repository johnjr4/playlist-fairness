import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { validateIntId } from '../../utils/middleware/requireIdParam.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { getPlaylistTrack, getPlaylistTrackFull } from '../../controllers/playlistTrackController.js';
import { playlistTrackToPublic, playlistTrackToPublicFull } from '../../utils/types/frontendTypeMapper.js';

// Prefix will be '/playlistTrack'
const router = express.Router();

router.param('playlistId', validateIntId);
router.param('trackId', validateIntId);

router.get('/:playlistId/:trackId',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.playlistId!);
        const trackId = parseInt(req.params.trackId!);
        const playlistTrack = await getPlaylistTrack(playlistId, trackId, req.session.user!.id);
        if (playlistTrack) {
            res.json(successfulResponse(
                `Successfully got playlistTrack (playlist: ${playlistId}, track: ${trackId})`,
                playlistTrackToPublic(playlistTrack),
            ))
        } else {
            res.status(404).json(errorResponse(
                `No playlistTrack of id (playlist: ${playlistId}, track: ${trackId}) belonging to user ${req.session.user!.id}`,
                null
            ))
        }
    })
);

// Return the PlaylistTrack *only if it belongs to the user*
router.get('/:playlistId/:trackId/full',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.playlistId!);
        const trackId = parseInt(req.params.trackId!);
        const playlistTrack = await getPlaylistTrackFull(playlistId, trackId, req.session.user!.id);
        if (playlistTrack) {
            res.json(successfulResponse(
                `Successfully got playlistTrack (playlist: ${playlistId}, track: ${trackId})`,
                playlistTrackToPublicFull(playlistTrack),
            ))
        } else {
            res.status(404).json(errorResponse(
                `No playlistTrack of id (playlist: ${playlistId}, track: ${trackId}) belonging to user ${req.session.user!.id}`,
                null
            ))
        }
    })
)

export default router;