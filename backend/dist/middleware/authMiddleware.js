"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError_1.AppError('Unauthorized: No token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    const payload = (0, jwt_1.verifyAccessToken)(token);
    if (!payload) {
        return next(new AppError_1.AppError('Unauthorized: Invalid token', 401));
    }
    req.user = {
        userId: payload.userId,
        role: payload.role
    };
    next();
};
exports.authenticateUser = authenticateUser;
