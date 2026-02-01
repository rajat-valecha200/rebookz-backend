import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req: AuthRequest, res: Response) => {
    // Check if admin? Middleware should handle, but extra check good
    if (req.user?.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized as admin' });
        return;
    }

    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
        ? {
            $or: [
                { name: { $regex: req.query.keyword as string, $options: 'i' } },
                { email: { $regex: req.query.keyword as string, $options: 'i' } },
                { phone: { $regex: req.query.keyword as string, $options: 'i' } },
            ],
        }
        : {};

    const filterConditions: any = { ...keyword };

    if (req.query.role) {
        filterConditions.role = req.query.role;
    }

    const count = await User.countDocuments(filterConditions);
    const users = await User.find(filterConditions)
        .select('-password') // Exclude password
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized as admin' });
        return;
    }

    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export { getUsers, deleteUser };
