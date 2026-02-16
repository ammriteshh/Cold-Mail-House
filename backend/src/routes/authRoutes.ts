
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
<<<<<<< HEAD
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect(`${process.env.FRONTEND_URL}/dashboard` || 'http://localhost:5173/dashboard');
=======
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
        // Successful authentication, redirect to frontend root (which shows Dashboard)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/`);
>>>>>>> 98bf376c254248ade89c2380a2f6378fb6947079
    }
);

router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

export default router;

