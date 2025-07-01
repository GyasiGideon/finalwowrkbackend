import express from 'express';
import {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
} from '../controllers/biuldingController.js';

const router = express.Router();

router.post('/', createBuilding);

// GET /api/buildings?user_id=xxx
router.get('/', getAllBuildings);

router.get('/:id', getBuildingById);
router.put('/:id', updateBuilding);
router.delete('/:id', deleteBuilding);

export default router;
