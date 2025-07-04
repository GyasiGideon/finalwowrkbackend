import {
  addDispenser,
  fetchAllDispensers,
  fetchDispenserById,
  editDispenser,
  removeDispenser,
  getDispensersByRoom, 
} from '../services/dispenserService.js';
import { insertDispenserLog } from '../models/logModel.js';
import { getBuildingByName } from '../services/biuldingService.js';
import { getRoomByName } from '../services/roomService.js';

export const createDispenser = async (req, res) => {
  try {
    const { user_id, building_name, room_name, dispenser_uid } = req.body;

    console.log('createDispenser called with:', { user_id, building_name, room_name, dispenser_uid });

    if (!user_id || !building_name || !room_name || !dispenser_uid) {
      console.warn('Missing required fields in request body');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const building = await getBuildingByName(user_id, building_name);
    if (!building) {
      console.warn(`Building not found for user_id=${user_id}, building_name=${building_name}`);
      return res.status(404).json({ error: 'Building not found' });
    }
    console.log('Found building:', building);

    const room = await getRoomByName(building.id, room_name);
    if (!room) {
      console.warn(`Room not found in building id=${building.id}, room_name=${room_name}`);
      return res.status(404).json({ error: 'Room not found' });
    }
    console.log('Found room:', room);

    const dispenser = await addDispenser(room.id, dispenser_uid);
    console.log('Dispenser created:', dispenser);

    res.status(201).json(dispenser);
  } catch (err) {
    console.error('Error in createDispenser:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllDispensers = async (_req, res) => {
  try {
    console.log('getAllDispensers called');
    const dispensers = await fetchAllDispensers();
    res.status(200).json(dispensers);
  } catch (err) {
    console.error('Error in getAllDispensers:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getDispenserById = async (req, res) => {
  try {
    console.log('getDispenserById called with id:', req.params.id);
    const dispenser = await fetchDispenserById(req.params.id);
    if (!dispenser) {
      console.warn(`Dispenser not found with id: ${req.params.id}`);
      return res.status(404).json({ message: 'Dispenser not found' });
    }
    res.status(200).json(dispenser);
  } catch (err) {
    console.error('Error in getDispenserById:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateDispenser = async (req, res) => {
  try {
    console.log('updateDispenser called with id:', req.params.id, 'body:', req.body);
    const updated = await editDispenser(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error in updateDispenser:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteDispenser = async (req, res) => {
  try {
    console.log('deleteDispenser called with id:', req.params.id);
    await removeDispenser(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Error in deleteDispenser:', err);
    res.status(500).json({ error: err.message });
  }
};

//  NEW: Get dispensers by roomId
export const getDispensersByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log('getDispensersByRoomId called with roomId:', roomId);
    const dispensers = await getDispensersByRoom(roomId);
    res.status(200).json(dispensers);
  } catch (err) {
    console.error('Error in getDispensersByRoomId:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateDispenserStatus = async (req, res) => {
  const { dispenser_uid, sanitizer_level, tissue_level, tamper_detected } = req.body;

  try {
    // 1. Get dispenser info
    const result = await db.query(
      'SELECT id, dispenser_uid FROM dispensers WHERE dispenser_uid = $1',
      [dispenser_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispenser not found' });
    }

    const dispenser = result.rows[0];

    // 2. Update status
    await db.query(
      `UPDATE dispensers
       SET sanitizer_level = $1, tissue_level = $2, tamper_detected = $3
       WHERE id = $4`,
      [sanitizer_level, tissue_level, tamper_detected, dispenser.id]
    );

    // 3. Auto-create logs
    if (sanitizer_level < 30) {
      await insertDispenserLog(dispenser.id, 'sanitizer low');
    }

    if (tissue_level < 30) {
      await insertDispenserLog(dispenser.id, 'tissue low');
    }

    if (tamper_detected === true) {
      await insertDispenserLog(dispenser.id, 'tamper detected');
    }

    res.status(200).json({ message: 'Dispenser status updated and logs created' });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update dispenser status' });
  }
};

export const logDispenserUsage = async (req, res) => {
  const { dispenser_uid, sanitizer_level, tissue_level } = req.body;

  if (!dispenser_uid || sanitizer_level == null || tissue_level == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Find dispenser by UID
    const result = await pool.query(
      'SELECT id FROM dispensers WHERE dispenser_uid = $1',
      [dispenser_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispenser not found' });
    }

    const dispenserId = result.rows[0].id;

    // Insert into reports table
    await pool.query(
      `INSERT INTO reports (dispenser_id, sanitizer_level, tissue_level)
       VALUES ($1, $2, $3)`,
      [dispenserId, sanitizer_level, tissue_level]
    );

    // Optionally update dispenser's current levels
    await pool.query(
      `UPDATE dispensers SET sanitizer_level = $1, tissue_level = $2 WHERE id = $3`,
      [sanitizer_level, tissue_level, dispenserId]
    );

    res.status(200).json({ message: 'Usage logged successfully' });
  } catch (err) {
    console.error('❌ Failed to log usage:', err);
    res.status(500).json({ error: 'Server error while logging usage' });
  }
};