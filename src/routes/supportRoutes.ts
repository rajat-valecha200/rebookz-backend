import express from 'express';
import { createTicket, getTickets, replyToTicket } from '../controllers/supportController';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', optionalAuth, createTicket);
router.get('/', protect, getTickets);
router.put('/:id/reply', protect, admin, replyToTicket);

export default router;
