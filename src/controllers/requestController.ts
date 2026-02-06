import { Request, Response } from 'express';
import BookRequest from '../models/BookRequest';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a book request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const { title, description, category } = req.body;

    const request = await BookRequest.create({
        title,
        description,
        category,
        user: req.user._id,
        status: 'active'
    });

    res.status(201).json(request);
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public (or Private?) - Let's make it Public so users can see lists? Or Private?
// Requirement says "Requests Page" with tabs. Let's make it Public for listing.
export const getRequests = async (req: Request, res: Response) => {
    // Optional: Filter by user via query ?user=ID for "My Requests"
    const filter: any = {};
    if (req.query.user) {
        filter.user = req.query.user;
    }

    const requests = await BookRequest.find(filter)
        .populate('user', 'name profileImage') // Show who requested
        .sort({ createdAt: -1 });

    res.json(requests);
};
