
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Returns the currently authenticated user.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.json({ user: req.user });
});

/**
 * Logs out the user by destroying the session.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});
