"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const prisma_1 = require("../db/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
const config_1 = require("../config");
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
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });
    res.status(201).json({ message: 'User registered successfully' });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !(await (0, password_1.comparePassword)(password, user.password))) {
        throw new AppError_1.AppError('Invalid credentials', 401);
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config_1.config.env === 'production',
        sameSite: config_1.config.env === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        throw new AppError_1.AppError('No refresh token', 401);
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    if (!payload)
        throw new AppError_1.AppError('Invalid refresh token', 403);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshToken) {
        throw new AppError_1.AppError('Invalid refresh token', 403);
    }
    const newAccessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    res.json({ accessToken: newAccessToken });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (payload) {
            await prisma_1.prisma.user.update({
                where: { id: payload.userId },
                data: { refreshToken: null }
            });
        }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});
