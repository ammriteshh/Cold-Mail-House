"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Google OAuth Login
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// Google OAuth Callback
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(`${process.env.FRONTEND_URL}/dashboard` || 'http://localhost:5173/dashboard');
});
router.post('/logout', authController_1.logout);
router.get('/me', authMiddleware_1.authenticateUser, authController_1.getMe);
exports.default = router;
