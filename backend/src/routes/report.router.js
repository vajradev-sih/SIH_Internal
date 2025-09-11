import express from 'express';
import { submitReport, getMyReports, getReportById, getAllReports } from '../controllers/report.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public route to get a single report (can be shown to public)
router.get('/:reportId', getReportById);

// All routes below are protected
router.use(authMiddleware);

// Submit a new report with file uploads
router.post('/submit', uploadMiddleware, submitReport);

// Get all reports for the logged-in user
router.get('/my-reports', getMyReports);

// Get all reports (for admin dashboard)
router.get('/all', getAllReports);

export default router;