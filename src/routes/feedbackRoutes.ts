import express from 'express';
import { createFeedback, getFeedbacks, deleteFeedback } from '../controllers/feedbackController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, createFeedback)
    .get(protect, admin, getFeedbacks);

router.route('/:id')
    .delete(protect, admin, deleteFeedback);

export default router;
