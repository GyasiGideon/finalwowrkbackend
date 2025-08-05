// services/dispenserService.js
import pool from '../config/db.js';

export async function addDispenser(roomId, dispenser_uid) {
  const result = await pool.query(
    `INSERT INTO dispensers (room_id, dispenser_uid)
     VALUES ($1, $2)
     RETURNING id, room_id, dispenser_uid, sanitizer_level, tissue_level, tamper_detected, created_at`,
    [roomId, dispenser_uid]
  );
  return result.rows[0];
}

export const fetchAllDispensers = async () => {
  const result = await pool.query(`SELECT * FROM dispensers`);
  return result.rows;
};

export const fetchDispenserById = async (id) => {
  const result = await pool.query(`SELECT * FROM dispensers WHERE id = $1`, [id]);
  return result.rows[0];
};

export const editDispenser = async (id, { dispenser_uid, system_status, connection_status }) => {
  const result = await pool.query(
    `UPDATE dispensers
     SET dispenser_uid = COALESCE($1, dispenser_uid),
         system_status = COALESCE($2, system_status),
         connection_status = COALESCE($3, connection_status)
     WHERE id = $4
     RETURNING *`,
    [dispenser_uid, system_status, connection_status, id]
  );
  return result.rows[0];
};

export const removeDispenser = async (id) => {
  await pool.query(`DELETE FROM dispensers WHERE id = $1`, [id]);
};

export const getDispensersByRoom = async (roomId) => {
  const result = await pool.query(`SELECT * FROM dispensers WHERE room_id = $1`, [roomId]);
  return result.rows;
};
