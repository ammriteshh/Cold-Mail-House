"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Initiate Google Login
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false }));
// Google Callback
router.get('/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    // User should be available in req.user from passport
    const user = req.user;
    if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});
exports.default = router;
