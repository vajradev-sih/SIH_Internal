import { Report } from '../models/report.model.js';
import { ReportAssignment } from '../models/reportAssignment.model.js';
import { ReportHistory } from '../models/reportHistory.model.js';
import { Notification } from '../models/notifications.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

// Update a report's status
const updateReportStatus = asyncHandler(async (req, res) => {
    // This function will be protected by isAdmin and isDepartmentAdmin middleware
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
    
    // Check if the status is actually changing
    if (previousStatus === newStatus) {
        throw new ApiError(400, "The report status is already " + newStatus);
    }

    report.status = newStatus;
    await report.save();

    // Create an audit log in ReportHistory
    await ReportHistory.create({
        reportId: report.reportId,
        previousStatus: previousStatus,
        newStatus: newStatus,
        changedByUserId: userId,
        remarks: remarks || `Status changed from ${previousStatus} to ${newStatus}.`
    });

    // Create a notification for the citizen who submitted the report
    await Notification.create({
        userId: report.userId,
        reportId: report.reportId,
        message: `Your report status has been updated to "${newStatus}".`,
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

    // Fetch the report to get its current status for the history log
    const report = await Report.findOne({ reportId });
    if (!report) {
        throw new ApiError(404, "Report not found.");
    }

    // Create a new assignment document
    const newAssignment = await ReportAssignment.create({
        reportId,
        departmentId,
        assigned_to_userId: assignedToUserId,
        assignedByUserId: userId, // Tracks who made the assignment
        status: 'assigned',
        remarks: `Report assigned to official.`
    });

    if (!newAssignment) {
        throw new ApiError(500, "Failed to assign report.");
    }
    
    // Create a history entry for the assignment
    await ReportHistory.create({
        reportId,
        previousStatus: report.status, // Use the report's current status
        newStatus: 'assigned',
        changedByUserId: userId,
        remarks: `Report assigned to a department official.`
    });

    // Create a notification for the assigned user
    await Notification.create({
        userId: assignedToUserId,
        reportId: report.reportId,
        message: `A new report has been assigned to you.`,
    });

    return res.status(200).json(
        new ApiResponse(200, newAssignment, 'Report assigned successfully.')
    );
});

export {
    isAdmin,
    updateReportStatus,
    assignReport,
};
