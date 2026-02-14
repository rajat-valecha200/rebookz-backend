import express from 'express';
import { getMobileBookFeed, getFreeBooks, getRecentlyViewedBooks, recordBookView } from '../controllers/mobileBookController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/books', getMobileBookFeed);
router.get('/books/free', getFreeBooks);
router.get('/books/recent', protect, getRecentlyViewedBooks);
router.post('/books/:id/view', protect, recordBookView);

export default router;
