import { Request, Response } from 'express';
import Category from '../models/Category';
import Book from '../models/Book';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req: Request, res: Response) => {
    const categories = await Category.find({ deleted_at: null });
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

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req: Request, res: Response) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
    }

    // Helper to get all descendant names and Mongo IDs recursively
    const getAllDescendants = async (parentId: number): Promise<any[]> => {
        const children = await Category.find({ parent_id: parentId, deleted_at: null });
        let descendants = [...children];
        for (const child of children) {
            const grandChildren = await getAllDescendants(child.id);
            descendants = [...descendants, ...grandChildren];
        }
        return descendants;
    };

    const descendants = await getAllDescendants(category.id);
    const categoryNames = [category.name, ...descendants.map(d => d.name)];
    const categoryMongoIds = [category._id, ...descendants.map(d => d._id)];

    // Check if any book is in these categories
    // Since books match by name (string) as per schema/seed
    const bookCount = await Book.countDocuments({
        category: { $in: categoryNames },
        status: { $ne: 'sold' } // Only count active/available books?
    });

    if (bookCount > 0) {
        // Mark only the target category as inactive
        category.is_active = false;
        await category.save();
        res.json({
            message: 'Category marked as inactive because it (or its subcategories) contains active books',
            action: 'deactivated',
            category
        });
    } else {
        // Soft delete the category and all descendants
        await Category.updateMany(
            { _id: { $in: categoryMongoIds } },
            { $set: { deleted_at: new Date(), is_active: false } }
        );
        res.json({
            message: 'Category and all subcategories deleted successfully',
            action: 'deleted'
        });
    }
};

export { getCategories, createCategory, deleteCategory };
