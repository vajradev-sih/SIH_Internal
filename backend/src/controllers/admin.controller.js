import { Report } from '../models/report.model.js';
import { ReportAssignment } from '../models/reportAssignment.model.js';
import { ReportHistory } from '../models/reportHistory.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Middleware to check if the user is an admin or super_admin
const isAdmin = (req, res, next) => {
    const { role } = req.user;
    if (role === 'department_admin' || role === 'super_admin') {
        next();
    } else {
        throw new ApiError(403, "Forbidden: You do not have administrative access.");
    }
};

// Update a report's status
const updateReportStatus = asyncHandler(async (req, res) => {
    // This function will be protected by isAdmin middleware
    const { reportId } = req.params;
    const { newStatus, remarks } = req.body;
    const { userId } = req.user;

    if (!newStatus) {
        throw new ApiError(400, "New status is required.");
    }

    const report = await Report.findOne({ reportId });
    if (!report) {
        throw new ApiError(404, "Report not found.");
    }

    const previousStatus = report.status;
    report.status = newStatus;
    await report.save();

    // Create an audit log in ReportHistory
    await ReportHistory.create({
        reportId,
        previousStatus,
        newStatus,
        changedByUserId: userId,
        remarks
    });

    return res.status(200).json(
        new ApiResponse(200, report, `Report status updated to ${newStatus}.`)
    );
});

// Assign a report to an official
const assignReport = asyncHandler(async (req, res) => {
    // This function will be protected by isAdmin middleware
    const { reportId } = req.params;
    const { departmentId, assignedToUserId } = req.body;
    const { userId } = req.user;

    if (!departmentId || !assignedToUserId) {
        throw new ApiError(400, "Department ID and assigned user ID are required.");
    }

    const report = await Report.findOne({ reportId });
    if (!report) {
        throw new ApiError(404, "Report not found.");
    }

    // Create a new assignment document
    const newAssignment = await ReportAssignment.create({
        reportId,
        departmentId,
        assignedToUserId,
        assignedByUserId: userId, // Tracks who made the assignment
        status: 'assigned',
        remarks: `Report assigned to official.`
    });

    if (!newAssignment) {
        throw new ApiError(500, "Failed to assign report.");
    }

    return res.status(200).json(
        new ApiResponse(200, newAssignment, 'Report assigned successfully.')
    );
});

export {
    isAdmin,
    updateReportStatus,
    assignReport,
};