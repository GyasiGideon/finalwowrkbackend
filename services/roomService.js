import db from '../config/db.js';

export const addRoom = async (building_id, name) => {
  const result = await db.query(
    `INSERT INTO rooms (id, building_id, name)
     VALUES (gen_random_uuid(), $1, $2)
     RETURNING *`,
    [building_id, name]
  );
  return result.rows[0];
};

export const fetchAllRooms = async () => {
  const result = await db.query(`SELECT * FROM rooms ORDER BY created_at DESC`);
  return result.rows;
};

export const fetchRoomById = async (room_id) => {
  const result = await db.query(`SELECT * FROM rooms WHERE id = $1`, [room_id]);
  return result.rows[0];
};

export const editRoom = async (room_id, name) => {
  const result = await db.query(
    `UPDATE rooms SET name = $1 WHERE id = $2 RETURNING *`,
    [name, room_id]
  );
  return result.rows[0];
};

export const removeRoom = async (room_id) => {
  const result = await db.query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [room_id]);
  return result.rows[0];
};

export const getRoomByName = async (building_id, name) => {
  const result = await db.query(
    `SELECT * FROM rooms WHERE building_id = $1 AND name = $2`,
    [building_id, name]
  );
  return result.rows[0];
};

export const fetchRoomsByBuildingId = async (building_id) => {
  const result = await db.query(
    `SELECT * FROM rooms WHERE building_id = $1 ORDER BY created_at DESC`,
    [building_id]
  );
  return result.rows;
};
