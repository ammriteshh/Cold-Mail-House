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

    // ─── Nodemailer / SMTP Setup ───────────────────────────────
    smtp: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || '',
    },

    rateLimit: {
        maxPerSenderPerHour: 100,
    },
};

// ─── Required env-var validation ──────────────────────────────────────────────
const requiredEnvVars = [
    'DATABASE_URL',
    'FRONTEND_URL',
    'SMTP_USER',
    'SMTP_PASS',
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0 && process.env.SKIP_ENV_CHECK !== 'true') {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}
