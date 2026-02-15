
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
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect(`${process.env.FRONTEND_URL}/dashboard` || 'http://localhost:5173/dashboard');
    }
);

router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

export default router;

