import { jest } from '@jest/globals';

// Mock model functions
const mockGetAllReports = jest.fn();
const mockCreateReport = jest.fn();
const mockGetReportsByDispenser = jest.fn();

// Mock the reportModel module before importing controller
jest.unstable_mockModule('./models/reportModel.js', () => ({
  getAllReports: mockGetAllReports,
  createReport: mockCreateReport,
  getReportsByDispenser: mockGetReportsByDispenser,
}));

// Import the mocked module
const reportModel = await import('./models/reportModel.js');

// Import controller after mocking
const {
  fetchReports,
  fetchReportsByDispenser,
  submitReport,
} = await import('./controllers/reportController.js');

describe('Report Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('fetchReports', () => {
    it('should return all reports with status 200', async () => {
      const mockReports = [
        { id: 'r1', dispenser_id: 'd1', sanitizer_level: 50, tissue_level: 70, fault: null },
        { id: 'r2', dispenser_id: 'd2', sanitizer_level: 30, tissue_level: 40, fault: 'leak' },
      ];
      mockGetAllReports.mockResolvedValue(mockReports);

      await fetchReports(req, res);

      expect(mockGetAllReports).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReports);
    });

    it('should handle errors and return 500', async () => {
      mockGetAllReports.mockRejectedValue(new Error('DB error'));

      await fetchReports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch reports' });
    });
  });

  describe('fetchReportsByDispenser', () => {
    it('should return reports for a dispenser with 200', async () => {
      const mockReports = [
        { id: 'r1', dispenser_id: 'd1', sanitizer_level: 50, tissue_level: 70, fault: null },
      ];
      mockGetReportsByDispenser.mockResolvedValue(mockReports);

      req.params = { dispenser_id: 'd1' };

      await fetchReportsByDispenser(req, res);

      expect(mockGetReportsByDispenser).toHaveBeenCalledWith('d1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReports);
    });

    it('should handle errors and return 500', async () => {
      mockGetReportsByDispenser.mockRejectedValue(new Error('DB error'));

      req.params = { dispenser_id: 'd1' };

      await fetchReportsByDispenser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch reports for this dispenser' });
    });
  });

  describe('submitReport', () => {
    it('should create a report and return 201', async () => {
      const mockReport = {
        id: 'r1',
        dispenser_id: 'd1',
        sanitizer_level: 60,
        tissue_level: 80,
        fault: null,
      };
      mockCreateReport.mockResolvedValue(mockReport);

      req.body = {
        dispenser_id: 'd1',
        sanitizer_level: 60,
        tissue_level: 80,
        fault: null,
      };

      await submitReport(req, res);

      expect(mockCreateReport).toHaveBeenCalledWith('d1', 60, 80, null);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReport);
    });

    it('should handle errors and return 500', async () => {
      mockCreateReport.mockRejectedValue(new Error('DB error'));

      req.body = {
        dispenser_id: 'd1',
        sanitizer_level: 60,
        tissue_level: 80,
        fault: null,
      };

      await submitReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create report' });
    });
  });
});
