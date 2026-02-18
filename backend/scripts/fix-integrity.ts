import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('🔍 Checking for orphaned jobs...');

    // Find all jobs
    const jobs = await prisma.job.findMany({
        select: {
            id: true,
            senderId: true,
        },
    });

    console.log(`📋 Found ${jobs.length} total jobs.`);

    let orphanedCount = 0;

    for (const job of jobs) {
        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: {
                id: job.senderId,
            },
        });

        if (!user) {
            console.warn(`⚠️ Found orphaned job ID: ${job.id} (senderId: ${job.senderId}) - User not found.`);
            // Delete the orphaned job
            await prisma.job.delete({
                where: { id: job.id }
            });
            console.log(`🗑️ Deleted job ID: ${job.id}`);
            orphanedCount++;
        }
    }

    console.log(`✅ Cleanup complete. Deleted ${orphanedCount} orphaned jobs.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
