import dotenv from 'dotenv';
import path from 'path';

// Try to load from .env file directly to be sure
// Assuming this script is run from backend root or backend/src
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sensitiveKeys = ['SECRET', 'KEY', 'PASS', 'TOKEN', 'CREDENTIAL'];

console.log("--- Environment Variables Check ---");
console.log(`Current Working Directory: ${process.cwd()}`);
console.log(`Node Environment: ${process.env.NODE_ENV}`);

const keysToCheck = [
    'PORT',
    'FRONTEND_URL',
    'API_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'JWT_SECRET',
    'REDIS_URL',
    'REDIS_HOST',
    'REDIS_PORT'
];

keysToCheck.forEach(key => {
    const value = process.env[key];
    if (!value) {
        console.log(`❌ ${key}: MISSING`);
    } else {
        const isSensitive = sensitiveKeys.some(s => key.includes(s));
        if (isSensitive) {
            // Mask all but first 3 and last 3 chars
            const masked = value.length > 6
                ? value.substring(0, 3) + '...' + value.substring(value.length - 3)
                : '***';
            console.log(`✅ ${key}: SET (${masked})`);
        } else {
            console.log(`✅ ${key}: SET (${value})`);
        }
    }
});

console.log("-----------------------------------");
