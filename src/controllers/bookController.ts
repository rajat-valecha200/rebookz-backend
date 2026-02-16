import { Request, Response } from 'express';
import Book from '../models/Book';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Fetch all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req: Request, res: Response) => {
    // Search Keyword (Title)
    const keyword = req.query.keyword
        ? {
            title: {
                $regex: req.query.keyword as string,
                $options: 'i',
            },
        }
        : {};

    // Filters
    const filterConditions: any = { ...keyword };

    if (req.query.category) {
        const categoryRegex = new RegExp(`^${(req.query.category as string).trim()}$`, 'i');
        filterConditions.$or = [
            { category: categoryRegex },
            { subcategory: categoryRegex }
        ];
    }
    if (req.query.type) {
        filterConditions.type = req.query.type;
    }
    if (req.query.status) {
        filterConditions.status = req.query.status;
    }

    const pageSize = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    const count = await Book.countDocuments(filterConditions);
    const books = await Book.find(filterConditions)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ books, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Fetch single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req: Request, res: Response) => {
    const book = await Book.findById(req.params.id).populate('seller', 'name email');

    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private
const createBook = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    // Enforce profile completion (Phone number is mandatory for listing books)
    if (!req.user.phone) {
        res.status(403).json({
            message: 'Please complete your profile (add phone number) before listing books',
            code: 'INCOMPLETE_PROFILE'
        });
        return;
    }

    const {
        title,
        author,
        description,
        category,
        subcategory,
        condition,
        type,
        price,
        images,
        location,
        school,
        board,
        classLevel,
        sellerPhone
    } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400).json({ message: 'At least one image is required' });
        return;
    }

    // Convert location to GeoJSON if provided as {lat, lng}
    let geoLocation;
    if (location && (typeof location.lat === 'number') && (typeof location.lng === 'number')) {
        geoLocation = {
            type: 'Point',
            coordinates: [location.lng, location.lat],
            address: location.address
        };
    } else {
        geoLocation = location; // Assume it's already correct or undefined
    }

    const book = new Book({
        title,
        author,
        description,
        category,
        subcategory,
        condition,
        type,
        price,
        images,
        seller: req.user._id,
        location: geoLocation,
        school,
        board,
        classLevel,
        sellerPhone,
        isAvailable: true,
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req: AuthRequest, res: Response) => {
    const {
        title,
        author,
        description,
        category,
        subcategory,
        condition,
        type,
        price,
        images,
        location,
        school,
        board,
        classLevel,
        isAvailable,
        status,
        sellerPhone
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
        // Check ownership or admin
        if (book.seller.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({ message: 'Not authorized to update this book' });
            return;
        }

        book.title = title || book.title;
        book.author = author || book.author;
        book.description = description || book.description;
        book.category = category || book.category;
        book.subcategory = subcategory || book.subcategory;
        book.condition = condition || book.condition;
        book.type = type || book.type;
        book.price = price !== undefined ? price : book.price;
        book.images = images || book.images;
        book.school = school || book.school;
        book.board = board || book.board;
        book.classLevel = classLevel || book.classLevel;
        book.sellerPhone = sellerPhone || book.sellerPhone;

        if (location) {
            if ((typeof location.lat === 'number') && (typeof location.lng === 'number')) {
                book.location = {
                    type: 'Point',
                    coordinates: [location.lng, location.lat],
                    address: location.address
                } as any;
            } else {
                book.location = location;
            }
        }

        book.isAvailable = isAvailable !== undefined ? isAvailable : book.isAvailable;
        book.status = status || book.status;

        const updatedBook = await book.save();
        res.json(updatedBook);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req: AuthRequest, res: Response) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        if (book.seller.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({ message: 'Not authorized to delete this book' });
            return;
        }

        await book.deleteOne();
        res.json({ message: 'Book removed' });
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

export { getBooks, getBookById, createBook, updateBook, deleteBook };
