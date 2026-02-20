
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Single-user mode: Returns a static authenticated user object.
 * No real session/auth needed — the app is for a single owner.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.json({
        user: {
            id: '1',
            name: 'Admin',
            email: process.env.SMTP_USER || 'admin@coldmailhouse.com',
            role: 'admin',
        }
    });
});

/**
 * Logout stub — no-op in single-user mode.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
});
