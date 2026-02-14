"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const globalErrorHandler = (err, req, res, next) => {
    console.error('🔥 ERROR:', err);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Handle generic errors
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
