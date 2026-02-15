"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
/**
 * Global Error Handling Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
    console.error('🔥 Global Error:', err);
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
