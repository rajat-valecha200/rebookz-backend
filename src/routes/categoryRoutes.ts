import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);
router.route('/:id').delete(protect, admin, deleteCategory);

export default router;
