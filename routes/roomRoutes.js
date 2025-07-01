// roomRoutes.js
import express from 'express';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByBuildingId, // new controller
} from '../controllers/roomController.js';

const router = express.Router();

// Existing routes...
router.post('/', createRoom);
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);


// New route to get rooms by building ID
router.get('/building/:buildingId', getRoomsByBuildingId);

export default router;
