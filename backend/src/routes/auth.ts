import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

// Initiate Google Login
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google Callback
router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err || !user) {
                console.error("❌ Google Auth Failed:", err || info);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    (req, res) => {
        // User should be available in req.user from passport
        const user = (req as any).user;

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

export default router;
