import express from 'express';
import { getUserUsageData } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/:userId', getUserUsageData);

export default router;