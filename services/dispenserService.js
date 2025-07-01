import pool from '../config/db.js';

export const getDispensersByRoom = async (roomId) => {
  const result = await pool.query(
    'SELECT * FROM dispensers WHERE room_id = $1 ORDER BY id',
    [roomId]
  );
  return result.rows;
};

export const addDispenser = async (roomId, dispenser_uid) => {
  const result = await pool.query(
    'INSERT INTO dispensers (room_id, dispenser_uid) VALUES ($1, $2) RETURNING *',
    [roomId, dispenser_uid]
  );
  return result.rows[0];
  
};



export const fetchAllDispensers = async () => {
  const result = await pool.query('SELECT * FROM dispensers ORDER BY id');
  return result.rows;
};

export const fetchDispenserById = async (id) => {
  const result = await pool.query('SELECT * FROM dispensers WHERE id = $1', [id]);
  return result.rows[0];
};

export const editDispenser = async (id, data) => {
  const { sanitizer_level, tissue_level, tamper_detected } = data;
  const result = await pool.query(
    `UPDATE dispensers 
     SET sanitizer_level = $1, tissue_level = $2, tamper_detected = $3 
     WHERE id = $4 
     RETURNING *`,
    [sanitizer_level, tissue_level, tamper_detected, id]
  );
  return result.rows[0];
};

export const removeDispenser = async (id) => {
  const result = await pool.query(
    'DELETE FROM dispensers WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
