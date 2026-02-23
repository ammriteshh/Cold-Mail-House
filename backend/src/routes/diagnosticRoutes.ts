import { Router, Request, Response } from 'express';
import { checkResendConfig } from '../services/emailService';

const router: Router = Router();

/**
 * GET /api/diagnostics/resend
 * Checks Resend API configuration and returns status.
 */
router.get('/resend', async (req: Request, res: Response) => {
    const result = checkResendConfig();

    res.status(result.ok ? 200 : 500).json({
        status: result.ok ? 'ok' : 'error',
        apiKeyPresent: result.apiKeyPresent,
        from: result.from,
        message: result.ok
            ? '✅ Resend is configured and ready'
            : '❌ Resend config error — check RESEND_API_KEY and EMAIL_FROM env vars on Render',
    });
});

export default router;
