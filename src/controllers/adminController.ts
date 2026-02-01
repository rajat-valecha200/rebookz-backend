import { Request, Response } from 'express';
import User from '../models/User';
import Book from '../models/Book';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalSold = await Book.countDocuments({ status: 'sold' });

    // Recent 5 books
    const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(5).populate('seller', 'name email');

    res.json({
        totalUsers,
        totalBooks,
        totalSold,
        recentBooks,
    });
};

export { getDashboardStats };
