import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

// Helper function to generate tokens
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findOne({ userId: userId });
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
};
// backend/src/controllers/user.controller.js (updated registerUser function)

const registerUser = asyncHandler(async (req, res) => {
    console.log("Received data from Postman:", req.body); 
    const { username, name, email, password, phoneNumber } = req.body;
    // The role is no longer taken from the request body

    if (!username || !name || !email || !password || !phoneNumber) {
        throw new ApiError(400, 'All required fields are needed for registration.');
    }

    if (!passwordRegex.test(password)) {
        throw new ApiError(400, 'Password does not meet complexity requirements.');
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, 'Username or email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hardcode the role to 'citizen' for all new registrations
    const newUser = await User.create({
        username,
        name,
        email,
        passwordHash: hashedPassword,
        role: 'citizen', // Hardcoded role
        phoneNumber
    });

    if (!newUser) {
        throw new ApiError(500, 'User creation failed on the server.');
    }

    return res.status(201).json(
        new ApiResponse(201, newUser, 'User registered successfully!')
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.userId);

    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request. Refresh token is missing.");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ userId: decodedToken.userId });

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user.userId);

    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { user } = req;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new password are required");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError(400, "Old password is not correct");
    }

    if (!passwordRegex.test(newPassword)) {
        throw new ApiError(400, "New password does not meet complexity requirements");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ userId: user.userId }, { passwordHash: hashedPassword });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});

// New controller function to handle forgot password requests
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required to reset password.");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found with that email address.");
    }

    // Generate a reset token and save it to the database
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a real application, you would send an email here.
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    console.log(`Password reset URL: ${resetUrl}`);

    return res.status(200).json(
        new ApiResponse(200, {}, `Password reset link sent to ${email}.`)
    );
});

// New controller function to handle password reset
const resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token.");
    }

    const { newPassword } = req.body;
    if (!newPassword || !passwordRegex.test(newPassword)) {
        throw new ApiError(400, 'New password does not meet complexity requirements.');
    }

    // Update user's password and clear the reset token
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password has been reset successfully.")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    forgotPassword,
    resetPassword
};