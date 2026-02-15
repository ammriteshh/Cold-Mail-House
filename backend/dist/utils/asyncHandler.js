"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Higher-order function to wrap async route handlers and catch errors.
 * Eliminates the need for try-catch blocks in every controller.
 *
 * @param {Function} fn - The async route handler function
 * @returns {RequestHandler} - A standard Express request handler
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
