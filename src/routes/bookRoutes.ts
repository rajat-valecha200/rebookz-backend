import express from 'express';
import {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
} from '../controllers/bookController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getBooks).post(protect, createBook);
router
    .route('/:id')
    .get(getBookById)
    .put(protect, updateBook)
    .delete(protect, deleteBook);

export default router;
