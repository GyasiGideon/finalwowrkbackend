import pool from '../config/db.js'; // ✅ Import correct DB connection

export const insertDispenserLog = async (dispenserId, message) => {
  await pool.query(
    `INSERT INTO dispenser_logs (dispenser_id, message)
     VALUES ($1, $2)`,
    [dispenserId, message]
  );
};

export const getLogsForUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT dl.message, dl.created_at, d.dispenser_uid
    FROM dispenser_logs dl
    JOIN dispensers d ON dl.dispenser_id = d.id
    JOIN rooms r ON d.room_id = r.id
    JOIN buildings b ON r.building_id = b.id
    WHERE b.user_id = $1
    ORDER BY dl.created_at DESC
    LIMIT 20
    `,
    [userId]
  );

  return result.rows;
};
