import { getLogsForUser } from '../models/logModel.js';

export const fetchUserLogs = async (req, res) => {
   const userId = req.params.user_id;

  try {
    const logs = await getLogsForUser(userId);

    const formatted = logs.map(log => ({
      message: `${log.dispenser_uid} - ${log.message} at ${new Date(log.created_at).toLocaleTimeString()}`
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Fetch logs failed:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};
