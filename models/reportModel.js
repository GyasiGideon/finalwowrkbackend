import pool from '../config/db.js';

// 1. Live dispenser status
export const getLiveDispenserStatusByUser = async (user_id) => {
  try {
    console.log(`🔍 Fetching live dispenser status for user: ${user_id}`);
    
    if (!user_id) {
      console.error('❌ User ID is required');
      throw new Error('User ID is required');
    }

    const result = await pool.query(
      `SELECT 
        d.id AS dispenser_id,
        d.dispenser_uid,
        COALESCE(d.sanitizer_level, 100) AS sanitizer_level,
        COALESCE(d.tissue_level, 100) AS tissue_level,
        COALESCE(d.tamper_detected, FALSE) AS tamper_detected,
        COALESCE(r.system_status, 'OFF') AS system_status,
        COALESCE(r.connection_status, 'OFFLINE') AS connection_status,
        COALESCE(r.created_at, d.created_at) AS created_at
      FROM dispensers d
      LEFT JOIN (
        SELECT DISTINCT ON (dispenser_id) 
          dispenser_id,
          system_status,
          connection_status,
          created_at
        FROM reports
        WHERE system_status IS NOT NULL 
          AND connection_status IS NOT NULL
        ORDER BY dispenser_id, created_at DESC
      ) r ON d.id = r.dispenser_id
      JOIN rooms rm ON d.room_id = rm.id
      JOIN buildings b ON rm.building_id = b.id
      WHERE b.user_id = $1
      ORDER BY d.created_at DESC`,
      [user_id]
    );
    
    console.log(`✅ Found ${result.rows.length} dispensers for user ${user_id}`);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error in getLiveDispenserStatusByUser for user ${user_id}:`, error);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Database connection failed');
    }
    
    // Check if it's a query syntax error
    if (error.code === '42601' || error.code === '42703') {
      throw new Error('Database query syntax error');
    }
    
    throw error;
  }
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
  try {
    console.log(`🔍 Fetching system and connection status for user: ${user_id}`);
    
    if (!user_id) {
      console.error('❌ User ID is required');
      throw new Error('User ID is required');
    }

    const result = await pool.query(
      `WITH latest_reports AS (
        SELECT 
          d.dispenser_uid,
          COALESCE(r.system_status, 'OFF') AS system_status,
          COALESCE(r.connection_status, 'OFFLINE') AS connection_status,
          COALESCE(r.fault, 'Available') AS fault,
          ROW_NUMBER() OVER (
            PARTITION BY d.id 
            ORDER BY r.created_at DESC
          ) AS rn
        FROM dispensers d
        LEFT JOIN reports r ON d.id = r.dispenser_id
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
      WHERE rn = 1 OR rn IS NULL
      ORDER BY dispenser_uid`,  
      [user_id]
    );
    
    console.log(`✅ Found ${result.rows.length} status records for user ${user_id}`);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error in getSystemAndConnectionStatusByUser for user ${user_id}:`, error);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Database connection failed');
    }
    
    // Check if it's a query syntax error
    if (error.code === '42601' || error.code === '42703') {
      throw new Error('Database query syntax error');
    }
    
    throw error;
  }
};

