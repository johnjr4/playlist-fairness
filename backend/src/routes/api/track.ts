import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { validateIntId } from '../../utils/middleware/requireIdParam.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { getTrack, getTrackFull } from '../../controllers/trackController.js';
import { trackToPublic, trackToPublicFull } from '../../utils/types/frontendTypeMapper.js';

// Prefix will be '/track'
const router = express.Router();

router.param('id', validateIntId);

router.get('/:id',
    asyncHandler(async (req, res) => {
        const trackId = parseInt(req.params.id!);
        const track = await getTrack(trackId);
        if (track) {
            res.json(successfulResponse(
                `Successfully got track ${trackId}`,
                trackToPublic(track),
            ))
        } else {
            res.status(404).json(errorResponse(
                `No track of id ${trackId}`,
                null
            ))
        }
    })
);

// Return the full track with only playlistTracks *belonging to the user*
router.get('/:id/full',
    asyncHandler(async (req, res) => {
        const trackId = parseInt(req.params.id!);
        const track = await getTrackFull(trackId, req.session.user!.id);
        if (track) {
            res.json(successfulResponse(
                `Successfully got track ${trackId}`,
                trackToPublicFull(track)
            ))
        } else {
            res.status(404).json(errorResponse(
                `No track of id ${trackId}`,
                null
            ))
        }

    })
)

export default router;