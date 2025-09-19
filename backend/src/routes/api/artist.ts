import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { validateIntId } from '../../utils/middleware/requireIdParam.js';
import { getAlbum, getAlbumFull } from '../../controllers/albumController.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { getArtist, getArtistFull } from '../../controllers/artistController.js';
import { artistToPublic, artistToPublicFull } from '../../utils/types/frontendTypeMapper.js';

// Prefix will be '/artist'
const router = express.Router();

router.param('id', validateIntId);

router.get('/:id',
    asyncHandler(async (req, res) => {
        const artistId = parseInt(req.params.id!);
        const artist = await getArtist(artistId);
        if (artist) {
            res.json(successfulResponse(
                `Successfully got artist ${artistId}`,
                artistToPublic(artist)
            ))
        } else {
            res.status(404).json(errorResponse(
                `No album of id ${artistId}`,
                null
            ))
        }
    })
);

router.get('/:id/full',
    asyncHandler(async (req, res) => {
        const artistId = parseInt(req.params.id!);
        const artist = await getArtistFull(artistId);
        if (artist) {
            res.json(successfulResponse(
                `Successfully got artist ${artistId}`,
                artistToPublicFull(artist)
            ))
        } else {
            res.status(404).json(errorResponse(
                `No album of id ${artistId}`,
                null
            ))
        }
    })
)

export default router;