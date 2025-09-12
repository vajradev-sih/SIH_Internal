import { Report } from '../models/report.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ReportHistory } from '../models/reportHistory.model.js';
import { Notification } from '../models/notifications.model.js';
import { Category } from '../models/category.model.js';

// Controller to submit a new civic issue report
const submitReport = asyncHandler(async (req, res) => {
    const { title, description, categoryId, locationLat, locationLng } = req.body;
    const { userId } = req.user;

    console.log(req.body);
    

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
    if (!req.files || !req.files.photo || !req.files.photo[0]) {
        throw new ApiError(400, 'A photo is required for the report.');
    }

    const photoLocalPath = req.files.photo[0].path;
    const voiceRecordingLocalPath = req.files.voiceRecording?.[0]?.path;

    // 4. Upload photo to Cloudinary
    const uploadedPhoto = await uploadOnCloudinary(photoLocalPath);
    if (!uploadedPhoto) {
        throw new ApiError(500, 'Failed to upload photo to cloud service.');
    }
    const photoUrl = uploadedPhoto.secure_url;

    // 5. Upload voice recording if it exists
    let voiceRecordingUrl = null;
    if (voiceRecordingLocalPath) {
        const uploadedVoiceRecording = await uploadOnCloudinary(voiceRecordingLocalPath);
        if (!uploadedVoiceRecording) {
            throw new ApiError(500, 'Failed to upload voice recording to cloud service.');
        }
        voiceRecordingUrl = uploadedVoiceRecording.secure_url;
    }

    // 6. Create new report in DB
    const newReport = await Report.create({
        userId,
        categoryId,
        title,
        description,
        photo_url: photoUrl,
        voice_recording_url: voiceRecordingUrl,
        location_lat: locationLat,
        location_lng: locationLng
    });

    if (!newReport) {
        throw new ApiError(500, 'Failed to create new report.');
    }

    // 7. Log initial report status in history
    await ReportHistory.create({
        reportId: newReport.reportId,
        previousStatus: null,
        newStatus: 'pending',
        changedByUserId: userId,
        remarks: 'Report submitted by user.'
    });

    // (Optional) Skip notification logic for now

    return res.status(201).json(
        new ApiResponse(201, newReport, 'Report submitted successfully.')
    );
});

// Other report controller functions remain unchanged

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
};