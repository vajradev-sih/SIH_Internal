import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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
        password_hash: {
            type: String,
            required: [true, "PASSWORD IS REQUIRED"]
        },
        role: {
            type: String,
            enum: ['citizen', 'department_admin', 'super_admin'],
            required: true
        },
        phone_number: {
            type: String,
            trim: true,
            // Using regex for validation
            match: [/^\\+?[0-9]{7,15}$/, 'Please provide a valid phone number.']
        },
        refreshToken: { // The field for refresh token
            type: String,
            trim: true
        }

    }, { timestamps: true }

)




export const User = mongoose.model("User", userSchema)
