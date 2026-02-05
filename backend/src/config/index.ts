import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    email: {
        host: 'smtp.ethereal.email',
        port: 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    rateLimit: {
        maxPerSenderPerHour: 100, // Default limit
    },
};
