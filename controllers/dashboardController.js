
import pool from '../config/db.js';
import { getDashboardStats } from '../models/dashboardModel.js';

export const fetchDashboardStats = async (req, res) => {
  const userId = req.params.user_id;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const stats = await getDashboardStats(userId);
    res.status(200).json(stats);
  } catch (err) {
    console.error('❌ Failed to fetch dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getUserUsageData = async (req, res) => {
  const userId = req.params.userId;

  try {
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
       ORDER BY r.created_at ASC;`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching usage data:', err);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
};