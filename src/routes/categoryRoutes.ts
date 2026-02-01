import express from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);

export default router;
