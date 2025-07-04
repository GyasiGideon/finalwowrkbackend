import { getRefillPredictions } from '../models/predictionModel.js';

export const fetchRefillPredictions = async (req, res) => {
  const { user_id } = req.params;

  try {
    const data = await getRefillPredictions(user_id);
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error fetching refill predictions:', err);
    res.status(500).json({ error: 'Failed to fetch refill predictions' });
  }
};
