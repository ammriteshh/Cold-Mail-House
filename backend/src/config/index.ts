import dotenv from 'dotenv';
dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    db: {
        url: process.env.DATABASE_URL,
    },

    redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },

    // ─── Resend (replaces Nodemailer / SMTP) ───────────────────────────────
    resend: {
        apiKey: process.env.RESEND_API_KEY || '',
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    },

    rateLimit: {
        maxPerSenderPerHour: 100,
    },
};

// ─── Required env-var validation ──────────────────────────────────────────────
const requiredEnvVars = [
    'DATABASE_URL',
    'FRONTEND_URL',
    'RESEND_API_KEY',
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0 && process.env.SKIP_ENV_CHECK !== 'true') {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}
