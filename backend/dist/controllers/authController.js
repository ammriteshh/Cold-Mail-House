"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const prisma_1 = require("../db/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
const config_1 = require("../config");
/**
 * Registers a new user.
 */
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        throw new AppError_1.AppError('Missing required fields', 400);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.AppError('User already exists', 409);
    }
    const hashedPassword = await (0, password_1.hashPassword)(password);
    await prisma_1.prisma.user.create({
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
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !(await (0, password_1.comparePassword)(password, user.password))) {
        throw new AppError_1.AppError('Invalid credentials', 401);
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    // Save refresh token in DB
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });
    // Send refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config_1.config.env === 'production',
        sameSite: config_1.config.env === 'production' ? 'none' : 'lax',
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
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        throw new AppError_1.AppError('No refresh token provided', 401);
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    if (!payload)
        throw new AppError_1.AppError('Invalid refresh token', 403);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
    // Verify token matches DB record (Rotation/Revocation check)
    if (!user || user.refreshToken !== refreshToken) {
        throw new AppError_1.AppError('Invalid or expired refresh token', 403);
    }
    const newAccessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    res.json({ accessToken: newAccessToken });
});
/**
 * Logs out the user by clearing the refresh token.
 */
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (payload) {
            await prisma_1.prisma.user.update({
                where: { id: payload.userId },
                data: { refreshToken: null } // Invalidate in DB
            });
        }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});
