import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { getPlaylist, getUserPlaylists } from '../../controllers/getFromDb.js';
import { playlistToPublic } from '../../utils/types/frontendTypeMapper.js';

// Prefix will be '/playlists'
const router = express.Router();

router.get('/',
    asyncHandler(async (req, res) => {
        const playlists = await getUserPlaylists(req.session.user!.id);
        res.json({
            success: true,
            message: "Playlists fetched successfully",
            data: playlists.map(p => playlistToPublic(p)),
        });
    })
);

router.get('/:id',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylist(playlistId);
        res.json({
            success: true,
            message: `Playlist ${playlistId} fetched successfully`,
            data: playlist,
        });
    })
);

router.get('/:id/full',
    asyncHandler(async (req, res) => {
        const playlistId = parseInt(req.params.id!);
        const playlist = await getPlaylist(playlistId, true);
        res.json({
            success: true,
            message: `Playlist ${playlistId} fetched successfully`,
            data: playlist,
        });
    })
);

export default router;