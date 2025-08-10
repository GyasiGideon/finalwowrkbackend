import pool from '../config/db.js'; // 

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
    SELECT
      d.dispenser_uid,
      r.created_at,
      CASE
        WHEN r.fault = 'unavailable' THEN CONCAT('Dispenser ', d.dispenser_uid, ' is unavailable.')
        WHEN r.tissue_level <= 30 THEN CONCAT('Tissue for dispenser ', d.dispenser_uid, ' is low.')
        WHEN r.sanitizer_level <= 30 THEN CONCAT('Sanitizer for dispenser ', d.dispenser_uid, ' is low.')
        ELSE NULL
      END AS message
    FROM reports r
    JOIN dispensers d ON r.dispenser_id = d.id
    JOIN rooms rm ON d.room_id = rm.id
    JOIN buildings b ON rm.building_id = b.id
    WHERE b.user_id = $1
      AND (
        r.fault = 'unavailable' OR
        r.tissue_level <= 30 OR
        r.sanitizer_level <= 30
      )
    ORDER BY r.created_at DESC
    LIMIT 20
    `,
    [userId]
  );

  // Filter out null messages just in case
  const filteredRows = result.rows.filter(row => row.message !== null);
 console.log(filteredRows)
  return filteredRows;
};
