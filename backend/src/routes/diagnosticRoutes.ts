import { Router, Request, Response } from 'express';
import { verifyConnection } from '../services/emailService';
import { config } from '../config';

const router: Router = Router();

/**
 * GET /api/diagnostics/smtp
 * Verifies SMTP connection and returns status + config (password redacted)
 */
router.get('/smtp', async (req: Request, res: Response) => {
    const ok = await verifyConnection();

    res.status(ok ? 200 : 500).json({
        status: ok ? 'ok' : 'error',
        smtp: {
            host: config.email.host,
            port: config.email.port,
            user: config.email.user,
            from: config.email.from,
            secure: config.email.port === 465,
            // never expose the password
        },
        message: ok
            ? '✅ SMTP connection verified'
            : '❌ SMTP connection failed — check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars on Render',
    });
});

export default router;
