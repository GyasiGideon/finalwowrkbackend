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
      AND r.created_at >= CURRENT_DATE - INTERVAL '30 days'  -- Only consider recent data
    ),
    avg_usage AS (
      SELECT
        dispenser_id,
        COALESCE(
          NULLIF(ROUND(AVG(NULLIF(prev_sanitizer - sanitizer_level, 0)), 2), 0),
          0.1  -- Default minimal sanitizer usage (0.1% per day)
        ) AS avg_sanitizer_usage,
        COALESCE(
          NULLIF(ROUND(AVG(NULLIF(prev_tissue - tissue_level, 0)), 2), 0),
          0.1  -- Default minimal tissue usage (0.1% per day)
        ) AS avg_tissue_usage
      FROM usage_stats
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
            CURRENT_DATE + (
              COALESCE(
                (SELECT r2.sanitizer_level 
                 FROM reports r2 
                 WHERE r2.dispenser_id = d.id 
                 ORDER BY r2.created_at DESC 
                 LIMIT 1),
                d.sanitizer_level
              ) / au.avg_sanitizer_usage
            ) * INTERVAL '1 day', 
            'FMDay, Month DD, YYYY'
          )
        ELSE 'Insufficient data'  -- More descriptive than N/A
      END AS sanitizer_finish_date,
      CASE 
        WHEN au.avg_tissue_usage > 0 THEN 
          to_char(
            CURRENT_DATE + (
              COALESCE(
                (SELECT r3.tissue_level 
                 FROM reports r3 
                 WHERE r3.dispenser_id = d.id 
                 ORDER BY r3.created_at DESC 
                 LIMIT 1),
                d.tissue_level
              ) / au.avg_tissue_usage
            ) * INTERVAL '1 day', 
            'FMDay, Month DD, YYYY'
          )
        ELSE 'Insufficient data'
      END AS tissue_finish_date,
      (SELECT COUNT(*) FROM reports WHERE dispenser_id = d.id) AS report_count  -- Helpful for debugging
    FROM dispensers d
    JOIN rooms r ON d.room_id = r.id
    JOIN buildings b ON r.building_id = b.id
    LEFT JOIN avg_usage au ON d.id = au.dispenser_id
    WHERE b.user_id = $1
    ORDER BY d.created_at DESC;
  `, [user_id]);

  return result.rows.map(row => ({
    ...row,
    // Convert null to 'N/A' at the JavaScript level for consistency
    sanitizer_finish_date: row.sanitizer_finish_date || 'N/A',
    tissue_finish_date: row.tissue_finish_date || 'N/A',
    // Add stock status indicators
    sanitizer_status: row.sanitizer_level >= 30 ? 'Good Stock' : 'Low Stock',
    tissue_status: row.tissue_level >= 30 ? 'Good Stock' : 'Low Stock'
  }));
};