// routes/logRoutes.js
import express from 'express';
import { fetchUserLogs} from '../controllers/logController.js';

const router = express.Router();

// GET /api/logs/user/:user_id
router.get('/user/:user_id', fetchUserLogs);

export default router;
