import { Request, Response } from 'express';
import Category from '../models/Category';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req: Request, res: Response) => {
    const categories = await Category.find({});
    res.json(categories);
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req: Request, res: Response) => {
    const { name, icon_name, description, has_child, parent_id } = req.body;

    // Auto-generate ID (SimpleMax + 1) strategy
    const lastCategory = await Category.findOne({}, { id: 1 }).sort({ id: -1 });
    const nextId = lastCategory && lastCategory.id ? lastCategory.id + 1 : 1;

    const category = new Category({
        id: nextId,
        name,
        icon_name: icon_name || 'book', // Default icon
        description,
        has_child: has_child || false,
        parent_id,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
};

export { getCategories, createCategory };
