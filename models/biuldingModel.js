import pool from '../config/db.js';

export const getAllBuildings = async () => {
  const result = await pool.query('SELECT * FROM buildings ORDER BY id');
  return result.rows;
};

export const createBuilding = async (name) => {
  const result = await pool.query(
    'INSERT INTO buildings (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

export const deleteBuilding = async (id) => {
  const result = await pool.query(
    'DELETE FROM buildings WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
