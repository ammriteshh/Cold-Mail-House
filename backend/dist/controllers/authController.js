"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
/**
 * Returns the currently authenticated user.
 */
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json({ user: req.user });
});
/**
 * Logs out the user by destroying the session.
 */
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});
