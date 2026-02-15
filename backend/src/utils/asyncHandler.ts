import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Higher-order function to wrap async route handlers and catch errors.
 * Eliminates the need for try-catch blocks in every controller.
 * 
 * @param {Function} fn - The async route handler function
 * @returns {RequestHandler} - A standard Express request handler
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
