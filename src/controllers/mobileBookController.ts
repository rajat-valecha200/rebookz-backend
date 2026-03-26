import { Request, Response } from 'express';
import Book from '../models/Book';
import Category from '../models/Category';
import RecentView from '../models/RecentView';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get Books Feed for Mobile (Nearby first, then others)
// @route   GET /api/mobile/books
// @access  Public
export const getMobileBookFeed = async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius, limit, page, minPrice, maxPrice, condition, category, region } = req.query;
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const maxDistance = parseFloat(radius as string) || 50000;

        let query: any = { isAvailable: true };

        // Regional isolation: Treat missing region as 'SA' by default
        const targetRegion = (region as string) || 'SA';
        query.$or = [{ region: targetRegion }];
        if (targetRegion === 'SA') {
            query.$or.push({ region: { $exists: false } });
            query.$or.push({ region: null });
        }

        // Filters
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice as string);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
        }
        if (condition) query.condition = condition;

        if (req.query.category) {
            const categoryName = (req.query.category as string).trim();

            // Find the category and all its children to include in search
            const allCategories = await Category.find({ is_active: true });

            const getChildNames = (parentId: number): string[] => {
                const children = allCategories.filter(c => c.parent_id === parentId);
                let names = children.map(c => c.name);
                children.forEach(c => {
                    if (c.has_child) {
                        names = [...names, ...getChildNames(c.id)];
                    }
                });
                return names;
            };

            const targetCat = allCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            let searchNames = [categoryName];

            if (targetCat) {
                searchNames = [targetCat.name, ...getChildNames(targetCat.id)];
            }

            // Create case-insensitive regex for each name
            const nameRegexes = searchNames.map(name => new RegExp(`^${name}$`, 'i'));

            query.$or = [
                { category: { $in: nameRegexes } },
                { subcategory: { $in: nameRegexes } }
            ];
        }

        let books;
        let total = 0;

        if (lat && lng) {
            const userLat = parseFloat(lat as string);
            const userLng = parseFloat(lng as string);

            const pipeline: any[] = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [userLng, userLat] },
                        distanceField: 'distance',
                        distanceMultiplier: 0.001,
                        spherical: true,
                        query: query, // Apply filters here
                    }
                },
                { $sort: { distance: 1 } },
                { $skip: (pageNum - 1) * limitNum },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'seller',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: '$seller' },
                {
                    $project: {
                        'seller.password': 0,
                        'seller.__v': 0
                    }
                }
            ];

            books = await Book.aggregate(pipeline);
            total = await Book.countDocuments(query);

        } else {
            total = await Book.countDocuments(query);
            books = await Book.find(query)
                .populate('seller', 'name email phone profileImage')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
        }

        res.json({
            books,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total
        });

    } catch (error) {
        console.error('Mobile Feed Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Record a book view
// @route   POST /api/mobile/books/:id/view
// @access  Private
export const recordBookView = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const bookId = req.params.id;

        // Upsert to update viewedAt if exists, or create new
        await RecentView.findOneAndUpdate(
            { user: req.user._id, book: bookId },
            { viewedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'View recorded' });
    } catch (error) {
        console.error('Record View Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get recently viewed books
// @route   GET /api/mobile/books/recent
// @access  Private
export const getRecentlyViewedBooks = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const views = await RecentView.find({ user: req.user._id })
            .sort({ viewedAt: -1 })
            .limit(10)
            .populate({
                path: 'book',
                populate: { path: 'seller', select: 'name email profileImage' }
            });

        const books = views.map(v => v.book).filter(b => b !== null);

        res.json(books);
    } catch (error) {
        console.error('Get Recent Views Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get free books (price 0)
// @route   GET /api/mobile/books/free
// @access  Public
export const getFreeBooks = async (req: Request, res: Response) => {
    try {
        const { lat, lng, limit, page, region } = req.query;
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 20;

        let query: any = { isAvailable: true, price: 0 };
        // Regional isolation: Treat missing region as 'SA' by default
        const targetRegion = (region as string) || 'SA';
        query.$or = [{ region: targetRegion }];
        if (targetRegion === 'SA') {
            query.$or.push({ region: { $exists: false } });
            query.$or.push({ region: null });
        }
        let books;
        let total = 0;

        if (lat && lng) {
            const userLat = parseFloat(lat as string);
            const userLng = parseFloat(lng as string);

            const pipeline: any[] = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [userLng, userLat] },
                        distanceField: 'distance',
                        distanceMultiplier: 0.001,
                        spherical: true,
                        query: query,
                    }
                },
                { $sort: { distance: 1 } },
                { $skip: (pageNum - 1) * limitNum },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'seller',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: '$seller' },
                { $project: { 'seller.password': 0, 'seller.__v': 0 } }
            ];

            books = await Book.aggregate(pipeline);
            total = await Book.countDocuments(query);
        } else {
            total = await Book.countDocuments(query);
            books = await Book.find(query)
                .populate('seller', 'name email profileImage')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
        }

        res.json({
            books,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Free Books Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
