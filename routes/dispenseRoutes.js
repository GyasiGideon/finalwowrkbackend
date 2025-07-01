import express from 'express';
import {
  createDispenser,
  getAllDispensers,
  getDispenserById,
  updateDispenser,
  deleteDispenser,
  getDispensersByRoomId, // ✅ added
} from '../controllers/dispenserController.js';
import { updateDispenserStatus } from '../controllers/dispenserController.js';

const router = express.Router();

router.post('/', createDispenser);
router.get('/', getAllDispensers);
router.get('/:id', getDispenserById);
router.put('/:id', updateDispenser);
router.delete('/:id', deleteDispenser);
router.put('/update-status', updateDispenserStatus); //

router.get('/room/:roomId', getDispensersByRoomId);

export default router;
