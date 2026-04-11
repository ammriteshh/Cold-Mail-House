import { Router, Request, Response } from 'express';
import { checkResendConfig } from '../services/emailService';

const router: Router = Router();

/**
 * GET /api/diagnostics/email
 * Checks Resend API configuration and returns status.
 */
router.get('/email', async (req: Request, res: Response) => {
    const result = checkResendConfig();

    res.status(result.ok ? 200 : 500).json({
        status: result.ok ? 'ok' : 'error',
        apiKeyPresent: result.apiKeyPresent,
        from: result.from,
        message: result.ok
            ? '✅ Resend is configured and ready'
            : '❌ Resend config error — check RESEND_API_KEY env var',
    });
});

export default router;
