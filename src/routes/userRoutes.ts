import express from 'express';
import { authUser, registerUser, sendOtp, verifyOtp } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';
import { getUsers, deleteUser } from '../controllers/userController';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;
