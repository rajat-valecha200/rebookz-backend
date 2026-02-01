import express from 'express';
import { getMobileBookFeed } from '../controllers/mobileBookController';

const router = express.Router();

router.get('/books', getMobileBookFeed);

export default router;
