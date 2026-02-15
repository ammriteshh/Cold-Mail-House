import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

// Extend Express Request interface to include user info
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

/**
 * Middleware to protect routes that require authentication.
 * Verifies the access token from the Authorization header.
 */
export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Unauthorized: No token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Unauthorized: Token format invalid', 401));
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
        return next(new AppError('Unauthorized: Invalid or expired token', 401));
    }

    req.user = {
        userId: payload.userId,
        role: payload.role || 'user'
    };

    next();
};
