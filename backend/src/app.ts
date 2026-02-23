
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import jobRoutes from "./routes/jobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import diagnosticRoutes from "./routes/diagnosticRoutes";
import { globalErrorHandler } from "./middleware/errorHandler";
import { sendEmail } from "./services/emailService";

const app = express();

/**
 * =======================
 * 🛠️ MIDDLEWARE
 * =======================
 */
app.use(express.json());

// Trust Proxy for Render/Heroku
app.set('trust proxy', 1);

// CORS Configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);

/**
 * =======================
 * 🛣️ ROUTES
 * =======================
 */

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

/**
 * GET /api/test-email
 * Sends a test email via Resend to verify the integration is working.
 */
app.get('/api/test-email', async (req: Request, res: Response) => {
    const to = (req.query.to as string) || 'amritesh6767@gmail.com';
    const subject = 'Cold Mail House — Test Email ✅';
    const html = `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
            <h2 style="color:#6366f1">Cold Mail House</h2>
            <p>This is a <strong>test email</strong> confirming that the Resend integration is working correctly.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb"/>
            <p style="color:#6b7280;font-size:12px">Sent via Resend API • ${new Date().toISOString()}</p>
        </div>
    `;

    try {
        const result = await sendEmail(to, subject, html);
        console.log(`✅ [test-email] Sent to ${to}. Resend ID: ${result.id}`);

        res.status(200).json({
            success: true,
            to,
            id: result.id,
            message: `Test email sent successfully to ${to}`,
        });
    } catch (err: any) {
        console.error('❌ [test-email] Failed:', err.message);
        res.status(500).json({
            success: false,
            error: err.message || 'Unknown error',
            hint: 'Check RESEND_API_KEY and EMAIL_FROM env vars',
        });
    }
});

// Auth Routes (Single User Mode — no real session needed)
app.use("/auth", authRoutes);

// Job & Analytics Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/diagnostics", diagnosticRoutes);

/**
 * =======================
 * ⚠️ ERROR HANDLING
 * =======================
 */
app.use(globalErrorHandler);

export { app };
