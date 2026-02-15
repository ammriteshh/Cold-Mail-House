"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
/**
 * Middleware to protect routes that require authentication.
 * Verifies the access token from the Authorization header.
 */
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError_1.AppError('Unauthorized: No token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(new AppError_1.AppError('Unauthorized: Token format invalid', 401));
    }
    const payload = (0, jwt_1.verifyAccessToken)(token);
    if (!payload) {
        return next(new AppError_1.AppError('Unauthorized: Invalid or expired token', 401));
    }
    req.user = {
        userId: payload.userId,
        role: payload.role || 'user'
    };
    next();
};
exports.authenticateUser = authenticateUser;
