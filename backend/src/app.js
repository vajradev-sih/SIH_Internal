import express from 'express';
import { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importing the route files
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.router.js";
import notificationRoutes from "./routes/notification.router.js";
import departmentRoutes from './routes/department.router.js';
import analyticsRoutes from './routes/analytic.router.js';
import adminRoutes from './routes/admin.router.js';
import reportHistoryRoutes from './routes/reportHistory.router.js';
import reportRoutes from './routes/report.router.js';


const app = express();

// Middleware to set up CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));

// Middleware to serve static files
app.use(express.static("public"));

// Middleware to parse cookies
app.use(cookieParser());


// ------------------ API Routes ------------------
// Base route for all user-related endpoints
app.use("/api/v1/users", userRoutes);

// Base route for all category-related endpoints
app.use("/api/v1/categories", categoryRoutes);

// Base route for all notification-related endpoints
app.use("/api/v1/notifications", notificationRoutes);

// Base route for all department-related endpoints
app.use("/api/v1/departments", departmentRoutes);

// Base route for all analytics-related endpoints
app.use("/api/v1/analytics", analyticsRoutes);

// Base route for all admin-related endpoints
app.use("/api/v1/admin", adminRoutes);

// Base route for all report-related endpoints
app.use("/api/v1/reports", reportRoutes);

// Base route for report history
app.use("/api/v1/reports", reportHistoryRoutes);

// This app object is exported to be used in index.js
export { app };