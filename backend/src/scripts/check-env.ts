import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load from .env file directly to be sure
// Assuming this script is run from backend root or backend/src
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sensitiveKeys = ['SECRET', 'KEY', 'PASS', 'TOKEN', 'CREDENTIAL'];
let output = '';

output += "--- Environment Variables Check ---\n";
output += `Current Working Directory: ${process.cwd()}\n`;
output += `Node Environment: ${process.env.NODE_ENV}\n`;

const keysToCheck = [
    'PORT',
    'FRONTEND_URL',
    'API_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'REDIS_HOST',
    'REDIS_PORT'
];

keysToCheck.forEach(key => {
    const value = process.env[key];
    if (!value) {
        output += `❌ ${key}: MISSING\n`;
    } else {
        const isSensitive = sensitiveKeys.some(s => key.includes(s));
        if (isSensitive) {
            // Mask all but first 3 and last 3 chars
            const masked = value.length > 6
                ? value.substring(0, 3) + '...' + value.substring(value.length - 3)
                : '***';
            output += `✅ ${key}: SET (${masked})\n`;
        } else {
            output += `✅ ${key}: SET (${value})\n`;
        }
    }
});

output += "-----------------------------------\n";

fs.writeFileSync(path.resolve(__dirname, '../../env-check-output.txt'), output, 'utf8');
console.log("Output written to env-check-output.txt");
