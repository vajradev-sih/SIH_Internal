import { Report } from '../models/report.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ReportHistory } from '../models/reportHistory.model.js';
import { Notification } from '../models/notifications.model.js';
import { Category } from '../models/category.model.js'; // Import the Category model

// Controller to submit a new civic issue report
const submitReport = asyncHandler(async (req, res) => {
    const { title, description, categoryId, locationLat, locationLng } = req.body;
    const { userId } = req.user;

    // 1. Validate required fields
    if (!title || !description || !categoryId || !locationLat || !locationLng) {
        throw new ApiError(400, 'All required fields (title, description, categoryId, locationLat, locationLng) are needed for the report.');
    }

    // 2. Validate category existence
    const categoryExists = await Category.findOne({ categoryId });
    if (!categoryExists) {
        throw new ApiError(404, 'The specified categoryId does not exist.');
    }

    // 3. Check if files were uploaded
    if (!req.files || !req.files.photo) {
        throw new ApiError(400, 'A photo is required for the report.');
    }

    // Since we're using express-fileupload, req.files is an object where keys are field names.
    const photoLocalPath = req.files.photo.tempFilePath;
    const voiceRecordingLocalPath = req.files.voiceRecording?.tempFilePath;

    // Upload photo to cloudinary
    const uploadedPhoto = await uploadOnCloudinary(photoLocalPath);
    if (!uploadedPhoto) {
        throw new ApiError(500, 'Failed to upload photo to cloud service.');
    }
    const photoUrl = uploadedPhoto.secure_url;

    // Upload voice recording if it exists
    let voiceRecordingUrl = null;
    if (voiceRecordingLocalPath) {
        const uploadedVoiceRecording = await uploadOnCloudinary(voiceRecordingLocalPath);
        if (!uploadedVoiceRecording) {
            throw new ApiError(500, 'Failed to upload voice recording to cloud service.');
        }
        voiceRecordingUrl = uploadedVoiceRecording.secure_url;
    }

    const newReport = await Report.create({
        userId,
        categoryId,
        title,
        description,
        photo_url: photoUrl, // Corrected from photoUrl to photo_url to match model
        voice_recording_url: voiceRecordingUrl, // Corrected from voiceRecordingUrl to voice_recording_url to match model
        location_lat: locationLat, // Corrected from locationLat to location_lat to match model
        location_lng: locationLng // Corrected from locationLng to location_lng to match model
    });

    if (!newReport) {
        throw new ApiError(500, 'Failed to create new report.');
    }

    // Log the initial report status to history
    await ReportHistory.create({
        reportId: newReport.reportId,
        previousStatus: null,
        newStatus: 'pending',
        changedByUserId: userId,
        remarks: 'Report submitted by user.'
    });

    // Create a notification for the admin
    // You'll need to fetch the admin user IDs to send them a notification.
    // For simplicity, we'll skip this part for now.

    return res.status(201).json(
        new ApiResponse(201, newReport, 'Report submitted successfully.')
    );
});

// Controller to fetch all reports submitted by the authenticated user
const getMyReports = asyncHandler(async (req, res) => {
    const { userId } = req.user;

    const reports = await Report.find({ userId: userId })
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 });

    if (!reports) {
        throw new ApiError(404, 'No reports found for this user.');
    }

    return res.status(200).json(
        new ApiResponse(200, reports, 'Reports fetched successfully.')
    );
});

// Controller to fetch all reports (for admin dashboard)
const getAllReports = asyncHandler(async (req, res) => {
    const { userId } = req.user;

    const reports = await Report.find()
        .populate('userId', 'username name email')
        .populate('categoryId', 'name description')
        .sort({ createdAt: -1 });

    if (!reports) {
        throw new ApiError(404, 'No reports found.');
    }

    return res.status(200).json(
        new ApiResponse(200, reports, 'All reports fetched successfully.')
    );
});

// Controller to fetch a single report by ID
const getReportById = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const report = await Report.findOne({ reportId: reportId })
        .populate('userId', 'username name email')
        .populate('categoryId', 'name description');

    if (!report) {
        throw new ApiError(404, 'Report not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, report, 'Report fetched successfully.')
    );
});


export {
    getReportById,
    submitReport,
    getMyReports,
    getAllReports
}