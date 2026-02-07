import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let output = '';

async function main() {
    try {
        output += "Initializing PrismaClient with Adapter...\n";

        const connectionString = process.env.DATABASE_URL;
        output += `Using connection string: ${connectionString ? 'SET' : 'MISSING'}\n`;

        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        console.log("Connecting to database...");
        output += "Connecting to database...\n";
        await prisma.$connect();
        console.log("✅ Connected to database.");
        output += "✅ Connected to database.\n";

        const userCount = await prisma.user.count();
        console.log(`✅ User table exists. Found ${userCount} users.`);
        output += `✅ User table exists. Found ${userCount} users.\n`;

        await prisma.$disconnect();
        await pool.end();

    } catch (error: any) {
        console.error("❌ Database Error:", error);
        output += `❌ Database Error: ${error.message}\n`;
        if (error.stack) output += `Stack: ${error.stack}\n`;
        output += `Error Object: ${JSON.stringify(error, null, 2)}\n`;
    } finally {
        fs.writeFileSync(path.resolve(__dirname, '../../db-check-output.txt'), output, 'utf8');
        console.log("Output written to db-check-output.txt");
    }
}

main();
