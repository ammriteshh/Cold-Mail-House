
import { Router } from 'express';
import passport from 'passport';
import { logout, getMe } from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Google OAuth Login
// Google OAuth Login
router.get('/google', (req, res, next) => {
    console.log("✅ [DEBUG] /auth/google hit");
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', (err: any, user: any, info: any) => {
            if (err) {
                console.error("❌ [DEBUG] Passport Error:", err);
                return res.status(500).json({ error: "Authentication failed", details: err.message });
            }
            if (!user) {
                console.error("❌ [DEBUG] No user returned:", info);
                return res.status(401).json({ error: "Authentication failed", details: "No user returned" });
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.error("❌ [DEBUG] Login Error:", err);
                    return res.status(500).json({ error: "Login failed", details: err.message });
                }
                next(); // Continue to success handler
            });
        })(req, res, next);
    },
    (req, res) => {
        // Successful authentication
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        console.log("✅ [DEBUG] OAuth Callback Hit");
        console.log("   - User:", req.user);
        console.log("   - Session ID:", req.sessionID);
        console.log("   - Redirecting to:", `${frontendUrl}/dashboard`);

        // Explicitly save session before redirect to ensure cookie is set
        req.session.save((err) => {
            if (err) {
                console.error("❌ [DEBUG] Session save error:", err);
                return res.redirect(`${frontendUrl}/login?error=session_save_failed`);
            }
            console.log("✅ [DEBUG] Session saved successfully");
            const setCookieHeader = res.getHeader('set-cookie');
            console.log("   - Set-Cookie Header:", setCookieHeader);
            // Redirect to dashboard
            res.redirect(`${frontendUrl}/dashboard`);
        });
    }
);

router.post('/logout', logout);

export default router;


