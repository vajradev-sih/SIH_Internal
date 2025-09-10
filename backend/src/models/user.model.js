import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        userId: {
            type: String,
            default: uuidv4,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email address'] 
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['citizen', 'department_admin', 'super_admin'],
            required: true
        },
        phoneNumber: {
            type: String,
            trim: true,
            match: [/^\\+?[0-9]{7,15}$/, 'Please provide a valid phone number.']
        },
        refreshToken: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

// Method to generate a JSON Web Token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            userId: this.userId,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            userId: this.userId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);