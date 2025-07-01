import pool from '../config/db.js';

export const getRoomsByBuilding = async (buildingId) => {
  const result = await pool.query(
    'SELECT * FROM rooms WHERE building_id = $1 ORDER BY id',
    [buildingId]
  );
  return result.rows;
};

export const createRoom = async (buildingId, name) => {
  const result = await pool.query(
    'INSERT INTO rooms (building_id, name) VALUES ($1, $2) RETURNING *',
    [buildingId, name]
  );
  return result.rows[0];
};

export const deleteRoom = async (id) => {
  const result = await pool.query(
    'DELETE FROM rooms WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
