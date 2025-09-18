import express from 'express';
import { asyncHandler } from '../../utils/middleware/handleServerError.js';

// Prefix will be '/album'
const router = express.Router();

router.get('/:id',
    asyncHandler(async (req, res) => {
        throw new Error("Testing error handling");
    })
);

export default router;