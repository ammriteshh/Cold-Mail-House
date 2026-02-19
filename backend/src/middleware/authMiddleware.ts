
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Extend Express Request interface generally handled by @types/passport, 
// but we can explicitly define our User type if needed, though req.user is populated by passport.

/**
 * Middleware to protect routes that require authentication using Sessions.
 */
/**
 * Middleware to protect routes.
 * For Single User Mode, we assume all API requests from the frontend are authorized
 * or we can add a simple API_KEY check later.
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // Open access for now as requested for simplicity
    return next();
};

