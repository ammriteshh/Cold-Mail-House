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
    jwt: {
        accessSecret: process.env.ACCESS_TOKEN_SECRET,
        refreshSecret: process.env.REFRESH_TOKEN_SECRET,
        accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    },
    email: {
        host: 'smtp.ethereal.email',
        port: 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    rateLimit: {
        maxPerSenderPerHour: 100,
    },
};

// Validate required environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET'
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}
