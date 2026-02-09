"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
let output = '';
async function main() {
    try {
        output += "Initializing PrismaClient with Adapter...\n";
        const connectionString = process.env.DATABASE_URL;
        output += `Using connection string: ${connectionString ? 'SET' : 'MISSING'}\n`;
        const pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        const prisma = new client_1.PrismaClient({ adapter });
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
    }
    catch (error) {
        console.error("❌ Database Error:", error);
        output += `❌ Database Error: ${error.message}\n`;
        if (error.stack)
            output += `Stack: ${error.stack}\n`;
        output += `Error Object: ${JSON.stringify(error, null, 2)}\n`;
    }
    finally {
        fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '../../db-check-output.txt'), output, 'utf8');
        console.log("Output written to db-check-output.txt");
    }
}
main();
