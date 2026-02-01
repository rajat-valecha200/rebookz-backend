import { Request, Response } from 'express';
import Book from '../models/Book';

// @desc    Get Books Feed for Mobile (Nearby first, then others)
// @route   GET /api/mobile/books
// @access  Public
export const getMobileBookFeed = async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius, limit, page } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const maxDistance = Number(radius) || 50000; // Default 50km if using strict filter, but we want all books.

        let books;
        let total = 0;

        if (lat && lng) {
            const userLat = Number(lat);
            const userLng = Number(lng);

            // Using aggregation pipeline to get sorted results
            // $geoNear MUST be the first stage
            const pipeline: any[] = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [userLng, userLat] },
                        distanceField: 'distance', // Output field with distance in meters
                        spherical: true,
                        // maxDistance: maxDistance, // Commented out to "get others" too? 
                        // If we want "nearby first THEN others", $geoNear sorts by distance. 
                        // If we unlimit maxDistance, it processes all documents with geometry.
                    }
                },
                {
                    $sort: { distance: 1 } // Ensure sorted by distance
                },
                {
                    $skip: (pageNum - 1) * limitNum
                },
                {
                    $limit: limitNum
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'seller',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                {
                    $unwind: '$seller'
                },
                {
                    $project: {
                        'seller.password': 0, // Exclude sensitive info
                        'seller.__v': 0
                    }
                }
            ];

            books = await Book.aggregate(pipeline);
            // Count? 
            // Aggregation count is tricky with pagination. Separate count query?
            total = await Book.countDocuments({});

        } else {
            // Fallback if no location: Sort by Newest
            total = await Book.countDocuments({});
            books = await Book.find({})
                .populate('seller', 'name email phone')
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
