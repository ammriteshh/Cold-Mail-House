import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Prisma Connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Unset');

try {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    prisma.$connect()
        .then(() => {
            console.log('Successfully connected to database');
            process.exit(0);
        })
        .catch((e) => {
            console.error('Connection failed:', e);
            process.exit(1);
        });
} catch (e) {
    console.error('Initialization failed:', e);
    process.exit(1);
}
