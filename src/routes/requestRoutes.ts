import express from 'express';
import { createRequest, getRequests } from '../controllers/requestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/', getRequests); // Public or Protected? Logic said Public for now.

export default router;
