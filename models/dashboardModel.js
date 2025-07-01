import pool from '../config/db.js';

export const getDashboardStats = async (userId) => {
  const query = `
    SELECT

      -- Total number of dispensers linked to the user
      (SELECT COUNT(*) FROM dispensers d
        JOIN rooms rm ON d.room_id = rm.id
        JOIN buildings b ON rm.building_id = b.id
        WHERE b.user_id = $1
      ) AS total_dispenses,

      -- Active Devices (not tampered)
      (SELECT COUNT(*) FROM dispensers d
        JOIN rooms rm ON d.room_id = rm.id
        JOIN buildings b ON rm.building_id = b.id
        WHERE b.user_id = $1 AND d.tamper_detected = FALSE
      ) AS active_devices,

      -- Low Refill Alerts (sum of low sanitizer and low tissue)
      (
        (SELECT COUNT(*) FROM dispensers d
          JOIN rooms rm ON d.room_id = rm.id
          JOIN buildings b ON rm.building_id = b.id
          WHERE b.user_id = $1 AND d.sanitizer_level <= 30)
        +
        (SELECT COUNT(*) FROM dispensers d
          JOIN rooms rm ON d.room_id = rm.id
          JOIN buildings b ON rm.building_id = b.id
          WHERE b.user_id = $1 AND d.tissue_level <= 30)
      ) AS low_refill_alerts,

      -- Dispensers created today
      (SELECT COUNT(*) FROM dispensers d
        JOIN rooms rm ON d.room_id = rm.id
        JOIN buildings b ON rm.building_id = b.id
        WHERE b.user_id = $1 AND DATE(d.created_at) = CURRENT_DATE
      ) AS todays_usage;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
