import express from 'express';
import {
    getDashboardStats,
    getSystemConfig,
    updateSystemConfig,
    createAdmin,
    getAdmins,
    resetAdminPassword
} from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);

// Admin Management
router.get('/users', protect, admin, getAdmins);
router.post('/create', protect, admin, createAdmin);
router.put('/reset-password', protect, admin, resetAdminPassword);

// System Config
router.get('/config', getSystemConfig); // Public for mobile app
router.put('/config', protect, admin, updateSystemConfig);

export default router;
