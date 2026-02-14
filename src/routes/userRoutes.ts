import express from 'express';
import { authUser, registerUser, sendOtp, verifyOtp, googleLogin, dummyLogin } from '../controllers/authController'; // Added googleLogin to authController import
import { protect, admin } from '../middleware/authMiddleware';
import { getUsers, deleteUser, suspendUser, updateProfile, toggleFavorite, getFavorites, createUser } from '../controllers/userController';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/google-login', googleLogin);
router.post('/dummy-login', dummyLogin); // Added new route
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.route('/').get(protect, admin, getUsers as any).post(protect, admin, createUser as any);
router.route('/:id').delete(protect, admin, deleteUser as any);
router.route('/profile').put(protect, updateProfile as any);
router.route('/:id/suspend').put(protect, admin, suspendUser as any);

router.route('/favorites/:id').put(protect, toggleFavorite as any);
router.route('/favorites').get(protect, getFavorites as any);

export default router;
