import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
export const createFeedback = async (req: AuthRequest, res: Response) => {
    const { type, content, rating, comment } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const feedback = await Feedback.create({
        user: req.user._id,
        type: type || 'suggestion',
        content: content || comment, // Content preferred, comment for legacy
        rating,
        comment
    });

    res.status(201).json(feedback);
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
export const getFeedbacks = async (req: AuthRequest, res: Response) => {
    // Basic admin check (could also be done in middleware)
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized as admin' });
        return;
    }

    const feedbacks = await Feedback.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(feedbacks);
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
export const deleteFeedback = async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized as admin' });
        return;
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404).json({ message: 'Feedback not found' });
        return;
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback removed' });
};
