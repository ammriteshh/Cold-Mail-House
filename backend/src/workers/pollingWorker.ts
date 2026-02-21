import { prisma } from '../db/prisma';
import { sendEmail } from '../services/emailService';
import { Job } from '@prisma/client';

/**
 * CONFIGURATION
 */
const POLLING_INTERVAL_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;

/**
 * Processes a single job
 */
/**
 * Processes a single job
 */
const processJob = async (job: Job) => {
    console.log(`📩 [Worker] Processing Job ID: ${job.id} for ${job.recipient}`);

    try {
        // Use the unified emailService (SMTP)
        const info = await sendEmail(job.recipient, job.subject, job.body);

        console.log(`✅ [Worker] Email Sent! Job ID: ${job.id}, Message ID: ${info.messageId}`);

        // Update Job Status
        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'COMPLETED',
                sentAt: new Date(),
            }
        });

    } catch (error: any) {
        console.error(`❌ [Worker] Job ${job.id} Failed:`, error.message);

        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'FAILED',
                failureReason: error.message || 'Unknown Error',
            }
        });
    }
};

/**
 * Main Worker Loop
 */
export const startPollingWorker = () => {
    console.log("👷 [PollingWorker] Starting Polling Worker...");
    console.log(`   - Interval: ${POLLING_INTERVAL_MS}ms`);

    setInterval(async () => {
        try {
            const now = new Date();

            // 1. Fetch Due Jobs
            const dueJobs = await prisma.job.findMany({
                where: {
                    status: 'PENDING',
                    scheduledAt: { lte: now }
                },
                take: 10 // Batch size
            });

            if (dueJobs.length === 0) {
                // console.log("💤 [Worker] No due jobs found.");
                return;
            }

            console.log(`🚀 [PollingWorker] Found ${dueJobs.length} due jobs.`);

            // 2. Process Jobs in Parallel (or limit concurrency)
            await Promise.all(dueJobs.map(job => processJob(job)));

        } catch (error) {
            console.error("🔥 [PollingWorker] Critical Loop Error:", error);
        }
    }, POLLING_INTERVAL_MS);
};

// Start the worker if this file is run directly
if (require.main === module) {
    startPollingWorker();
}
