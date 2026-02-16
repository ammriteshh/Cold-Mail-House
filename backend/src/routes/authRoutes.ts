
import { Router } from 'express';
import passport from 'passport';
import { logout, getMe } from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
        // Successful authentication
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Explicitly save session before redirect to ensure cookie is set
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.redirect(`${frontendUrl}/login?error=session_save_failed`);
            }
            // Redirect to dashboard
            res.redirect(`${frontendUrl}/dashboard`);
        });
    }
);

router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

export default router;

