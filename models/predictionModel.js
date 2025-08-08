import pool from '../config/db.js';

export const getRefillPredictions = async (user_id) => {
  const result = await pool.query(`
    WITH usage_stats AS (
      SELECT
        r.dispenser_id,
        r.created_at::date,
        r.sanitizer_level,
        r.tissue_level,
        LAG(r.sanitizer_level) OVER (PARTITION BY r.dispenser_id ORDER BY r.created_at) AS prev_sanitizer,
        LAG(r.tissue_level) OVER (PARTITION BY r.dispenser_id ORDER BY r.created_at) AS prev_tissue
      FROM reports r
      JOIN dispensers d ON r.dispenser_id = d.id
      JOIN rooms ro ON d.room_id = ro.id
      JOIN buildings b ON ro.building_id = b.id
      WHERE b.user_id = $1
    ),
    avg_usage AS (
      SELECT
        dispenser_id,
        ROUND(AVG(NULLIF(prev_sanitizer - sanitizer_level, 0)), 2) AS avg_sanitizer_usage,
        ROUND(AVG(NULLIF(prev_tissue - tissue_level, 0)), 2) AS avg_tissue_usage
      FROM usage_stats
      WHERE prev_sanitizer IS NOT NULL OR prev_tissue IS NOT NULL
      GROUP BY dispenser_id
    )
    SELECT 
      d.id AS dispenser_id,
      d.dispenser_uid,
      COALESCE(
        (SELECT r2.sanitizer_level 
         FROM reports r2 
         WHERE r2.dispenser_id = d.id 
         ORDER BY r2.created_at DESC 
         LIMIT 1),
        d.sanitizer_level
      ) AS sanitizer_level,
      COALESCE(
        (SELECT r3.tissue_level 
         FROM reports r3 
         WHERE r3.dispenser_id = d.id 
         ORDER BY r3.created_at DESC 
         LIMIT 1),
        d.tissue_level
      ) AS tissue_level,
      r.name AS room_name,
      b.name AS building_name,
      CASE 
        WHEN au.avg_sanitizer_usage > 0 THEN 
          to_char(
            current_date + (
              COALESCE(
                (SELECT r2.sanitizer_level 
                 FROM reports r2 
                 WHERE r2.dispenser_id = d.id 
                 ORDER BY r2.created_at DESC 
                 LIMIT 1),
                d.sanitizer_level
              ) / au.avg_sanitizer_usage
            ) * interval '1 day', 
            'Mon DD, YYYY'
          )
        ELSE "unknown"
      END AS sanitizer_finish_date,
      CASE 
        WHEN au.avg_tissue_usage > 0 THEN 
          to_char(
            current_date + (
              COALESCE(
                (SELECT r3.tissue_level 
                 FROM reports r3 
                 WHERE r3.dispenser_id = d.id 
                 ORDER BY r3.created_at DESC 
                 LIMIT 1),
                d.tissue_level
              ) / au.avg_tissue_usage
            ) * interval '1 day', 
            'Mon DD, YYYY'
          )
        ELSE "Unknown" 
      END AS tissue_finish_date
    FROM dispensers d
    JOIN rooms r ON d.room_id = r.id
    JOIN buildings b ON r.building_id = b.id
    LEFT JOIN avg_usage au ON d.id = au.dispenser_id
    WHERE b.user_id = $1
    ORDER BY d.created_at DESC;
  `, [user_id]);

  return result.rows;
};
