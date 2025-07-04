import express from 'express';
import { fetchRefillPredictions } from '../controllers/predictionController.js';

const router = express.Router();

// GET /api/predictions/user/:user_id
router.get('/user/:user_id', fetchRefillPredictions);

export default router;
