import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, 'Authorization denied, no token provided.');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedToken;
        next();

    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json(error);
        } else {
            console.error(error);
            res.status(401).json(new ApiError(401, 'Invalid or expired token.'));
        }
    }
};