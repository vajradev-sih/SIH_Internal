import express from 'express';
import { updateReportStatus, assignReport, isAdmin } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes below require a valid access token and an admin role
router.use(authMiddleware, isAdmin);

// Update a report's status
router.put('/reports/:reportId/status', updateReportStatus);

// Assign a report to an official
router.post('/reports/:reportId/assign', assignReport);

export default router;