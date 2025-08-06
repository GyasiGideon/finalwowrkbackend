import express from 'express';
import {
  fetchReports,
  fetchReportsByDispenser,
  submitReport,
  fetchReportsByUser,
    fetchUsageOverTime, 
  fetchLiveDispenserStatus, 
  fetchSystemAndConnectionStatus,
} from '../controllers/reportController.js';

const router = express.Router();

// Add this new route for time-series usage data
router.get('/usage/:user_id', fetchUsageOverTime);

// Get all reports (optional usage with ?user_id=)
router.get('/', fetchReports);

// Get reports from reports table for specific user
router.get('/user/:user_id', fetchReportsByUser);

// Get live dispenser data (not from reports table)
router.get('/live/:user_id', fetchLiveDispenserStatus);

// 🆕 Get only system_status and connection_status
router.get('/status/:user_id', fetchSystemAndConnectionStatus);

// Get reports for a specific dispenser
router.get('/:dispenser_id', fetchReportsByDispenser);

// Submit a new report
router.post('/', submitReport);



export default router;
