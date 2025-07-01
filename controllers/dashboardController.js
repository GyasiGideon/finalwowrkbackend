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
