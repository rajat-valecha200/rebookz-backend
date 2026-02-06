import { Request, Response } from 'express';
import SupportTicket from '../models/SupportTicket';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Public (Guests can create)
export const createTicket = async (req: AuthRequest, res: Response) => {
    const { contactEmail, contactPhone, category, description } = req.body;

    // If logged in, attach user
    const user = req.user ? req.user._id : undefined;

    const ticket = await SupportTicket.create({
        user,
        contactEmail,
        contactPhone,
        category,
        description,
        status: 'open'
    });

    res.status(201).json(ticket);
};

// @desc    Get all tickets (Admin)
// @route   GET /api/support
// @access  Private/Admin
export const getTickets = async (req: AuthRequest, res: Response) => {
    // Verify Admin role
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized as admin' });
        return;
    }

    const tickets = await SupportTicket.find({})
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

    res.json(tickets);
};
