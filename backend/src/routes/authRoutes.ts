
import { Router } from 'express';
import { logout, getMe } from '../controllers/authController';

const router = Router();

/**
 * Single-user mode auth routes.
 * No OAuth or session needed — the app is owner-only.
 */

// Get current "user" (always returns the static admin)
router.get('/me', getMe);

// Logout stub
router.post('/logout', logout);

export default router;
