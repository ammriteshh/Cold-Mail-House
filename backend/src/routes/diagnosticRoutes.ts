import { Router, Request, Response } from 'express';
import { checkResendConfig } from '../services/emailService';

const router: Router = Router();

/**
 * GET /api/diagnostics/smtp
 * Checks SMTP API configuration and returns status.
 */
router.get('/smtp', async (req: Request, res: Response) => {
    const result = checkResendConfig();

    res.status(result.ok ? 200 : 500).json({
        status: result.ok ? 'ok' : 'error',
        apiKeyPresent: result.apiKeyPresent, // this actually tells us if config is present now
        from: result.from,
        message: result.ok
            ? '✅ SMTP is configured and ready'
            : '❌ SMTP config error — check SMTP_USER and SMTP_PASS env vars',
    });
});

export default router;
