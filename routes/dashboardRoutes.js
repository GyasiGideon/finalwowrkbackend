import express from 'express';
import { fetchDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats/:user_id', fetchDashboardStats);

export default router;
