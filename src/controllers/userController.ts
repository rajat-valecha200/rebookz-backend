import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';


// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req: AuthRequest, res: Response) => {
    // Check if admin? Middleware should handle, but extra check good
    if (req.user?.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized as admin' });
        return;
    }

    const pageSize = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

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

    // Hide hidden admins unless it's the super admin requesting
    if (req.user?.email !== 'rajatvalecha@rebookz.com') {
        filterConditions.isHiddenAdmin = { $ne: true };
    }

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

// @desc    Update User Profile (Self)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        if (req.body.age) user.age = req.body.age;
        if (req.body.dob) {
            user.dob = req.body.dob;
            // Calculate age
            const today = new Date();
            const birthDate = new Date(req.body.dob);

            if (!isNaN(birthDate.getTime())) {
                let ageCalc = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    ageCalc--;
                }
                if (!isNaN(ageCalc)) {
                    user.age = ageCalc;
                }
            }
        }

        // Only override age if it's a valid number and provided
        if (req.body.age !== undefined && req.body.age !== null && !isNaN(Number(req.body.age))) {
            user.age = Number(req.body.age);
        }
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.pushToken) user.pushToken = req.body.pushToken;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            age: updatedUser.age,
            dob: updatedUser.dob,
            gender: updatedUser.gender,
            token: generateToken((updatedUser._id as unknown) as string),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete own user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteSelfAccount = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        // TODO: Consider deleting user's books and other related data
        await user.deleteOne();
        res.json({ message: 'Account deleted successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export { getUsers, deleteUser, suspendUser, updateProfile, toggleFavorite, getFavorites, createUser, deleteSelfAccount };

// @desc    Create User (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized as admin' });
        return;
    }

    const { name, email, phone, password, role } = req.body;

    const query: any = { email };
    if (phone) {
        query.$or = [{ email }, { phone }];
    }

    const userExists = await User.findOne(query);

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        phone,
        password: password || '123456', // Default password if not provided? Or required.
        role: role || 'user'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get User Favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id).populate('favorites');

    if (user) {
        // Need to populate more? Book -> Seller?
        // Deep population might be needed: .populate({ path: 'favorites', populate: { path: 'seller', select: 'name' } })
        const populatedUser = await User.findById(req.user?._id).populate({
            path: 'favorites',
            populate: { path: 'seller', select: 'name email phone' }
        });

        res.json({ favorites: populatedUser?.favorites || [] });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Toggle Favorite Book
// @route   PUT /api/users/favorites/:id
// @access  Private
const toggleFavorite = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);
    const bookId = req.params.id;

    if (user) {
        if (!user.favorites) user.favorites = [];

        // Check if already favorited
        const index = user.favorites.indexOf(bookId as any);

        if (index > -1) {
            // Remove
            user.favorites.splice(index, 1);
            await user.save();
            res.json({ message: 'Removed from favorites', isFavorited: false });
        } else {
            // Add
            user.favorites.push(bookId as any);
            await user.save();
            res.json({ message: 'Added to favorites', isFavorited: true });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Suspend/Unsuspend User (Admin)
// @route   PUT /api/users/:id/suspend
// @access  Private/Admin
const suspendUser = async (req: AuthRequest, res: Response) => {
    // Check if admin
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized as admin' });
        return;
    }

    const { isSuspended } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        user.isSuspended = isSuspended;
        await user.save();
        res.json({ message: `User ${isSuspended ? 'suspended' : 'activated'}`, isSuspended: user.isSuspended });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
