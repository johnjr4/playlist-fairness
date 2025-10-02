import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';
import { validateUserUuid } from '../../utils/middleware/requireIdParam.js';
import { errorResponse, successfulResponse } from '../../utils/apiResponses.js';
import { getUser } from '../../controllers/getFromDb.js';
import { getUserStats } from '../../controllers/userController.js';
import { deleteUserAndOwnedData } from '../../controllers/deleteData.js';
import { userToPublic } from '../../utils/types/frontendTypeMapper.js';

// Prefix will be '/user'
const router = express.Router();

// Return user
router.get('/',
    asyncHandler(async (req, res) => {
        const user = await getUser(req.session.user!.id);
        if (user) {
            res.json(successfulResponse(
                'Successfully got user',
                userToPublic(user)
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

// Require frontend to submit userId for an additional layer of deletion safety
router.param('userId', validateUserUuid);
// Delete user
router.delete('/:userId',
    asyncHandler(async (req, res) => {
        const requestedId = req.params.userId as string;
        const sessionId = req.session.user!.id as string;
        console.log(`requestedId: ${requestedId}`);
        console.log(`sessionId: ${sessionId}`);
        if (requestedId !== sessionId) {
            return res.status(400).json(errorResponse(
                "Requested deletion for different user than authenticated",
                'BAD_REQUEST'
            ));
        }
        // Delete all their data and newly orphaned data
        const deletedUser = await deleteUserAndOwnedData(sessionId);
        if (!deletedUser) {
            return res.status(500).json(errorResponse(
                'Failed to delete user data',
                'INTERNAL_SERVER_ERROR'
            ))
        }
        return res.json(successfulResponse(
            'Successfully deleted user',
            userToPublic(deletedUser)
        ));
    })
);

export default router;