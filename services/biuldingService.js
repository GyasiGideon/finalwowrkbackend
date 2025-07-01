// services/buildingService.js
import db from '../config/db.js';

export const createBuilding = async (user_id, name) => {
  const result = await db.query(
    'INSERT INTO buildings (user_id, name) VALUES ($1, $2) RETURNING *',
    [user_id, name]
  );
  return result.rows[0];
};



export const getBuildingsByUser = async (user_id) => {
  const result = await db.query(
    `SELECT * FROM buildings WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return result.rows;
};

export const getBuildingById = async (building_id) => {
  const result = await db.query(
    `SELECT * FROM buildings WHERE id = $1`,
    [building_id]
  );
  return result.rows[0];
};

export const updateBuilding = async (building_id, name) => {
  const result = await db.query(
    `UPDATE buildings SET name = $1 WHERE id = $2 RETURNING *`,
    [name, building_id]
  );
  return result.rows[0];
};

export const deleteBuilding = async (building_id) => {
  const result = await db.query(
    `DELETE FROM buildings WHERE id = $1 RETURNING *`,
    [building_id]
  );
  return result.rows[0];
};

export const getBuildingByName = async (user_id, name) => {
  const result = await db.query(
    `SELECT * FROM buildings WHERE user_id = $1 AND name = $2`,
    [user_id, name]
  );
  return result.rows[0];
};