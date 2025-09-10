import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
} from "../controllers/usercontroller.js";
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes for user authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require a valid token)
router.post('/logout', authMiddleware, logoutUser);
router.post('/change-password', authMiddleware, changeCurrentPassword);
router.get('/current-user', authMiddleware, getCurrentUser);

// Refresh token route (does not need authMiddleware as it works on the refresh token)
router.post('/refresh-token', refreshAccessToken);

export default router;