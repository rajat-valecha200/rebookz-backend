import { Request, Response } from 'express';
import BookRequest from '../models/BookRequest';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import { sendPushNotification } from '../utils/sendNotification';

// @desc    Create a book request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const { title, description, category, region, requesterPhone } = req.body;

    const request = await BookRequest.create({
        title,
        description,
        category,
        user: req.user._id,
        status: 'active',
        region: region || 'SA', // Fallback
        requesterPhone: requesterPhone
    });

    // Broadcast Notification
    try {
        const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('_id');
        const userIds = allUsers.map(u => u._id.toString());

        if (userIds.length > 0) {
            sendPushNotification(userIds, `New Book Request: ${title}`, { requestId: request._id });
        }
    } catch (e) {
        console.error("Notification Error", e);
    }

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
    if (req.query.region) {
        filter.region = req.query.region;
    }

    const requests = await BookRequest.find(filter)
        .populate('user', 'name profileImage') // Show who requested
        .populate('fulfilledBy', 'title images price type') // Details of the fulfilling book
        .sort({ createdAt: -1 });

    res.json(requests);
};

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Public
export const getRequestById = async (req: Request, res: Response) => {
    try {
        const request = await BookRequest.findById(req.params.id)
            .populate('user', 'name profileImage phone')
            .populate('fulfilledBy', 'title images price type _id');
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a request
// @route   PUT /api/requests/:id
// @access  Private
export const updateRequest = async (req: AuthRequest, res: Response) => {
    try {
        const request = await BookRequest.findById(req.params.id);
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }

        // Check ownership OR Admin
        const isOwner = request.user.toString() === req.user?._id.toString();
        const isAdmin = req.user?.role === 'admin';

        if (!isOwner && !isAdmin) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const { title, description, category, status } = req.body;
        request.title = title || request.title;
        request.description = description || request.description;
        request.category = category || request.category;

        // Admin or Owner can update status
        if (status) {
            request.status = status;
        }

        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private
export const deleteRequest = async (req: AuthRequest, res: Response) => {
    try {
        const request = await BookRequest.findById(req.params.id);
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }

        // Check ownership
        if (request.user.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await request.deleteOne();
        res.json({ message: 'Request removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
