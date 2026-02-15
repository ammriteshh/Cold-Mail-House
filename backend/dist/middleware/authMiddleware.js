"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const AppError_1 = require("../utils/AppError");
// Extend Express Request interface generally handled by @types/passport, 
// but we can explicitly define our User type if needed, though req.user is populated by passport.
/**
 * Middleware to protect routes that require authentication using Sessions.
 */
const authenticateUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return next(new AppError_1.AppError('Unauthorized: Please log in', 401));
};
exports.authenticateUser = authenticateUser;
