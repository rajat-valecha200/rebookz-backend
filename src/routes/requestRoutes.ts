import express from 'express';
import { createRequest, getRequests, getRequestById, updateRequest, deleteRequest } from '../controllers/requestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.put('/:id', protect, updateRequest);
router.delete('/:id', protect, deleteRequest);

export default router;
