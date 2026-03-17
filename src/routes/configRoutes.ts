import express from 'express';
import { getAppSettings, updateAppSettings } from '../controllers/configController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/app-settings', getAppSettings);
router.put('/app-settings', protect, admin, updateAppSettings);

export default router;
