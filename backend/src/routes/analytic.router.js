import express from 'express';
import { getDashboardSummary } from '../controllers/analytic.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// A protected route for getting dashboard data
router.get('/dashboard', authMiddleware, getDashboardSummary);

export default router;