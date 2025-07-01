import {
  addRoom,
  fetchAllRooms,
  fetchRoomById,
  editRoom,
  removeRoom,
    fetchRoomsByBuildingId, 
} from '../services/roomService.js';
import { getBuildingByName } from '../services/biuldingService.js';

export const createRoom = async (req, res) => {
  try {
    const { user_id, building_name, name } = req.body;

    const building = await getBuildingByName(user_id, building_name);
    if (!building) {
      return res.status(404).json({ error: 'Building not found for user' });
    }

    const room = await addRoom(building.id, name);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getRoomsByBuildingId = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const rooms = await fetchRoomsByBuildingId(buildingId);
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllRooms = async (_req, res) => {
  try {
    const rooms = await fetchAllRooms();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await fetchRoomById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await editRoom(req.params.id, name);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    await removeRoom(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
