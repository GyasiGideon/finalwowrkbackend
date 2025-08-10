import pool from '../config/db.js';

// 1. Live dispenser status
export const getLiveDispenserStatusByUser = async (user_id) => {
  // In reportService.getLiveDispenserStatus()
const result = await pool.query(
  `SELECT 
    d.id AS dispenser_id,
    d.dispenser_uid,
    d.sanitizer_level,
    d.tissue_level,
    d.tamper_detected,
    r.system_status,
    r.connection_status,
    r.created_at
  FROM dispensers d
  LEFT JOIN (
    SELECT DISTINCT ON (dispenser_id) *
    FROM reports
    ORDER BY dispenser_id, created_at DESC
  ) r ON d.id = r.dispenser_id
  JOIN rooms rm ON d.room_id = rm.id
  JOIN buildings b ON rm.building_id = b.id
  WHERE b.user_id = $1`,
  [user_id]
);
  return result.rows;
};

// 2. Create report
export const createReport = async (dispenser_id, sanitizer_level, tissue_level, fault) => {
  const result = await pool.query(
    `INSERT INTO reports (dispenser_id, sanitizer_level, tissue_level, fault) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [dispenser_id, sanitizer_level, tissue_level, fault]
  );
  return result.rows[0];
};

// 🟢 3. Get reports by dispenser
export const getReportsByDispenser = async (dispenser_id) => {
  const result = await pool.query(
    'SELECT * FROM reports WHERE dispenser_id = $1 ORDER BY created_at DESC',
    [dispenser_id]
  );
  return result.rows;
};

// ✅ 4. Get reports by user (add this)
export const getReportsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT r.*, d.dispenser_uid, rm.name AS room_name
     FROM reports r
     JOIN dispensers d ON r.dispenser_id = d.id
     JOIN rooms rm ON d.room_id = rm.id
     JOIN buildings b ON rm.building_id = b.id
     WHERE b.user_id = $1
     ORDER BY r.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

export const getUsageOverTimeByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT 
       r.created_at::date AS date,
       100 - r.sanitizer_level AS sanitizer_usage,
       100 - r.tissue_level AS tissue_usage
     FROM reports r
     JOIN dispensers d ON r.dispenser_id = d.id
     JOIN rooms ro ON d.room_id = ro.id
     JOIN buildings b ON ro.building_id = b.id
     WHERE b.user_id = $1
     ORDER BY r.created_at ASC`,
    [user_id]
  );
  return result.rows;
};

export const getSystemAndConnectionStatusByUser = async (user_id) => {
  const result = await pool.query(
    `WITH latest_reports AS (
      SELECT 
        d.dispenser_uid,
        r.system_status,
        r.connection_status,
        COALESCE(r.fault, 'Available') AS fault,  -- Ensures fault is never null
        ROW_NUMBER() OVER (
          PARTITION BY d.id 
          ORDER BY r.created_at DESC
        ) AS rn
      FROM reports r
      JOIN dispensers d ON r.dispenser_id = d.id
      JOIN rooms rm ON d.room_id = rm.id
      JOIN buildings b ON rm.building_id = b.id
      WHERE b.user_id = $1
    )
    SELECT 
      dispenser_uid,
      system_status,
      connection_status,
      fault
    FROM latest_reports
    WHERE rn = 1`,  
    [user_id]
  );
  
  console.log('✅ System and connection status:', result.rows);
  return result.rows;
};

