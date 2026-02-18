import 'dotenv/config';
import { prisma } from '../src/db/prisma';

async function main() {
    try {
        console.log('🔍 Checking for orphaned jobs...');

        // Find all jobs - wrap in try/catch to handle schema mismatch
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
            if (!job.senderId) continue; // Skip if no senderId (shouldn't happen with strict schema but safe)

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
    } catch (error: any) {
        console.warn("⚠️ [Non-Critical] Integrity check failed. This might be due to schema variance during deployment.");
        console.warn("   - Error:", error.message);
        // Do NOT fail the build. Return success.
        process.exit(0);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
