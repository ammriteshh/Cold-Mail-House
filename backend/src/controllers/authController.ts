import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { config } from '../config';

/**
 * Registers a new user.
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        throw new AppError('Missing required fields', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError('User already exists', 409);
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });

    res.status(201).json({ message: 'User registered successfully' });
});

/**
 * Logs in a user and issues tokens.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
        throw new AppError('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in DB
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    // Send refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * Refreshes the access token using a valid refresh token.
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new AppError('No refresh token provided', 401);

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) throw new AppError('Invalid refresh token', 403);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    // Verify token matches DB record (Rotation/Revocation check)
    if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid or expired refresh token', 403);
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    res.json({ accessToken: newAccessToken });
});

/**
 * Logs out the user by clearing the refresh token.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        const payload = verifyRefreshToken(refreshToken);
        if (payload) {
            await prisma.user.update({
                where: { id: payload.userId },
                data: { refreshToken: null } // Invalidate in DB
            });
        }
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});
