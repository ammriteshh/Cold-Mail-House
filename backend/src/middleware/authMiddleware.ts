
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Extend Express Request interface generally handled by @types/passport, 
// but we can explicitly define our User type if needed, though req.user is populated by passport.

/**
 * Middleware to protect routes that require authentication using Sessions.
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return next(new AppError('Unauthorized: Please log in', 401));
};

