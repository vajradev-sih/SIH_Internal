import express from 'express';
import { updateReportStatus, assignReport, resolveReport } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isDepartmentAdmin } from '../middlewares/departmentAdmin.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';
import { isAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

// All routes below require a valid access token and an admin role
router.use(authMiddleware, isAdmin);

// Update a report's status - now also requires department admin access
router.put('/reports/:reportId/status', isDepartmentAdmin, updateReportStatus);

// Assign a report to an official
router.post('/reports/:reportId/assign', assignReport);

// New endpoint to mark a report as solved with a photo
router.post('/reports/:reportId/resolve', uploadMiddleware, resolveReport);

export default router;