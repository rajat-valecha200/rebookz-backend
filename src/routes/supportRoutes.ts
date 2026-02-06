import express from 'express';
import { createTicket, getTickets } from '../controllers/supportController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// optionalAuth for createTicket so we can attach user if they are logged in, but not block guests.
// Wait, I don't have optionalAuth middleware yet. I should create it or just use public endpoint and manually check header?
// Or just make it public. The controller checks req.user if present.
// I'll make logic in controller to check req.user if middleware populated it.
// Standard `protect` throws 401. So I need `optionalAuth`.
// For now, let's just use `protect` for getTickets (Admin).
// For createTicket, if I use `protect`, guests can't use it.
// So createTicket should be Public. If client sends token, middleware needs to parse it without erroring.
// Let's assume standard app flow: Guests won't send header. Users will.
// But `protect` middleware implementation usually errors if expected token not valid.
// I will create `optionalAuthMiddleware` in next step or just route without it and rely on User ID passed in body? No, that's insecure spoofing.
// Plan: Create optionalAuth middleware rapidly or just skip user attachment for guests.
// Correct approach: `router.post('/', optionalAuth, createTicket)`
// I will implement `optionalAuth` in `authMiddleware.ts` first.

router.post('/', createTicket); // Public for now (Guest). User attachment logic might need refinement.
router.get('/', protect, getTickets); // Admin only (Checked in controller)

export default router;
