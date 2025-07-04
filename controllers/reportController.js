import {
  createReport,
  getReportsByDispenser,
  getReportsByUser,
  getLiveDispenserStatusByUser,
  getUsageOverTimeByUser,
} from '../models/reportModel.js';

// GET /api/reports?user_id=abc123 
export const fetchReports = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const reports = await getReportsByUser(user_id);
    res.status(200).json(reports);
  } catch (error) {
    console.error('❌ Failed to fetch reports by query:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const fetchUsageOverTime = async (req, res) => {
  try {
    const { user_id } = req.params;
    const usage = await getUsageOverTimeByUser(user_id);
    res.status(200).json(usage);
  } catch (error) {
    console.error('❌ Failed to fetch usage over time:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
};

//  GET /api/reports/user/:user_id (fetch from reports table)
export const fetchReportsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const reports = await getReportsByUser(user_id);
    res.status(200).json(reports);
  } catch (error) {
    console.error('❌ Failed to fetch reports by user:', error);
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
};

//  GET /api/reports/live/:user_id (fetch from live dispenser status)
export const fetchLiveDispenserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const status = await getLiveDispenserStatusByUser(user_id);
    res.status(200).json(status);
  } catch (error) {
    console.error('❌ Failed to fetch live dispenser status:', error);
    res.status(500).json({ error: 'Failed to fetch live dispenser status' });
  }
};

//  GET /api/reports/:dispenser_id (all reports for 1 dispenser)
export const fetchReportsByDispenser = async (req, res) => {
  try {
    const { dispenser_id } = req.params;
    const reports = await getReportsByDispenser(dispenser_id);
    res.status(200).json(reports);
  } catch (error) {
    console.error('❌ Failed to fetch reports for dispenser:', error);
    res.status(500).json({ error: 'Failed to fetch reports for this dispenser' });
  }
};

// POST /api/reports (submit new report)
export const submitReport = async (req, res) => {
  try {
    const { dispenser_id, sanitizer_level, tissue_level, fault } = req.body;
    const newReport = await createReport(
      dispenser_id,
      sanitizer_level,
      tissue_level,
      fault
    );
    res.status(201).json(newReport);
  } catch (error) {
    console.error('❌ Failed to create report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

