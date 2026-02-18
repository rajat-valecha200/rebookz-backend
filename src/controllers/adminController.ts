import { Request, Response } from 'express';
import User from '../models/User';
import Book from '../models/Book';
import Config from '../models/Config';
import bcrypt from 'bcryptjs';

import BookRequest from '../models/BookRequest';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req: any, res: Response) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalBooks = await Book.countDocuments();
        const totalSold = await Book.countDocuments({ status: 'sold' });
        const totalRequests = await BookRequest.countDocuments();

        // Recent 5 books
        const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(5).populate('seller', 'name email');

        // Recent 5 requests
        const recentRequests = await BookRequest.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

        // Recent 5 users (excluding hidden admins)
        const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('-password');

        res.json({
            totalUsers,
            totalBooks,
            totalSold,
            totalRequests,
            recentBooks,
            recentRequests,
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// @desc    Get system configuration (Public)
// @route   GET /api/admin/config
const getSystemConfig = async (req: Request, res: Response) => {
    try {
        const config = await Config.find();
        const configMap = config.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as any);
        res.json(configMap);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching config' });
    }
};

// @desc    Update system configuration (Super Admin only)
// @route   PUT /api/admin/config
const updateSystemConfig = async (req: any, res: Response) => {
    const { key, value } = req.body;

    // Strict check for super admin
    if (req.user.email !== 'rajatvalecha@rebookz.com') {
        return res.status(403).json({ message: 'Only Super Admin can change system settings' });
    }

    try {
        let config = await Config.findOne({ key });
        if (config) {
            config.value = value;
            await config.save();
        } else {
            await Config.create({ key, value });
        }
        res.json({ message: 'Config updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating config' });
    }
};

// @desc    Create new admin user
// @route   POST /api/admin/create
const createAdmin = async (req: any, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin' });
    }
};

// @desc    Get all admin users (except hidden ones)
// @route   GET /api/admin/users
const getAdmins = async (req: any, res: Response) => {
    try {
        // Only super admin can see hidden admins
        const query = req.user.email === 'rajatvalecha@rebookz.com' ? { role: 'admin' } : { role: 'admin', isHiddenAdmin: { $ne: true } };
        const admins = await User.find(query).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admins' });
    }
};

// @desc    Reset admin password (Authenticated)
// @route   PUT /api/admin/reset-password
const resetAdminPassword = async (req: any, res: Response) => {
    const { newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export {
    getDashboardStats,
    getSystemConfig,
    updateSystemConfig,
    createAdmin,
    getAdmins,
    resetAdminPassword
};
