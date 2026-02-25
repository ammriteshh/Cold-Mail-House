import { prisma } from '../db/prisma';
import { sendEmail } from '../services/emailService';
import { Job } from '@prisma/client';

const POLLING_INTERVAL_MS = 30000;
const MAX_RETRIES = 3;

const processJob = async (job: Job) => {
    console.log(`[PollingWorker] Processing Job ID: ${job.id} to ${job.recipient}`);

    try {
        const info = await sendEmail(job.recipient, job.subject, job.body);
        console.log(`[PollingWorker] Email sent for Job ID: ${job.id}. External ID: ${info.id}`);

        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'COMPLETED',
                sentAt: new Date(),
            }
        });

    } catch (error: any) {
        console.error(`[PollingWorker] Delivery failed for Job ${job.id}:`, error.message);

        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'FAILED',
                failureReason: error.message || 'Unknown Error',
            }
        });
    }
};

export const startPollingWorker = () => {
    console.log("[PollingWorker] Internal worker started (30s frequency)");

    setInterval(async () => {
        try {
            const now = new Date();

            const pendingJobs = await prisma.job.findMany({
                where: {
                    status: 'PENDING',
                    scheduledAt: { lte: now }
                },
                take: 10
            });

            if (pendingJobs.length === 0) return;

            console.log(`[PollingWorker] Found ${pendingJobs.length} scheduled jobs due for delivery.`);

            await Promise.all(pendingJobs.map(job => processJob(job)));

        } catch (error) {
            console.error("[PollingWorker] Loop error:", error);
        }
    }, POLLING_INTERVAL_MS);
};

// Start the worker if this file is run directly
if (require.main === module) {
    startPollingWorker();
}
