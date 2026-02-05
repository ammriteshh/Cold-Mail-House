import { Worker, Job } from 'bullmq';
import connection from '../config/redis';
import { prisma } from '../db/prisma';
import { sendEmail } from '../services/emailService';
import { config } from '../config';
import { EMAIL_QUEUE_NAME } from '../queues/emailQueue';

/**
 * Helper to get the start of the next hour in milliseconds.
 */
const getNextHourDelay = (): number => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Top of next hour
    return nextHour.getTime() - now.getTime();
};

const processEmailJob = async (job: Job) => {
    const { jobId } = job.data; // We expect job.data to contain the DB Job ID

    // 1. Fetch Job from DB
    const emailJob = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!emailJob) {
        console.error(`Job ${jobId} not found in DB`);
        return; // Should we throw? If DB is missing it, retrying likely won't help unless it's replication lag.
    }

    // 2. Idempotency Check
    if (emailJob.status === 'COMPLETED') {
        console.log(`Job ${jobId} already COMPLETED. Skipping.`);
        return;
    }

    // 3. Sender Rate Limiting (Redis-backed)
    const senderId = emailJob.senderId;
    const currentHour = new Date().toISOString().slice(0, 13); // Format: "YYYY-MM-DDTHH"
    const rateLimitKey = `rate-limit:sender:${senderId}:${currentHour}`;

    // Atomic increment
    const currentCount = await connection.incr(rateLimitKey);

    // Set expiry if it's the first increment (clean up key after 1 hour + buffer)
    if (currentCount === 1) {
        await connection.expire(rateLimitKey, 3600 + 60);
    }

    if (currentCount > config.rateLimit.maxPerSenderPerHour) {
        console.warn(`Rate limit exceeded for sender ${senderId}. Rescheduling Job ${jobId}.`);

        // Reschedule for next hour
        const delay = getNextHourDelay();
        await job.moveToDelayed(Date.now() + delay, job.token); // BullMQ: Move to delayed set

        // Decrease the counter since we didn't actually process it? 
        // Actually, keeping the counter high ensures other concurrent jobs also get rescheduled immediately, 
        // which is the desired behavior (fail fast for the rest of the hour).
        // So we DO NOT decrement.

        // Throwing error to interrupt current processing is generic pattern, 
        // but moveToDelayed updates state. We must return to stop execution.
        // However, BullMQ might mark as 'completed' if we just return?
        // moveToDelayed moves it out of 'active'. 
        // We throw a special error to signal "Moved manually".
        throw new Error(`RateLimit: Moved to delayed (Queue Order)`);
    }

    // 4. Send Email
    try {
        const info = await sendEmail(emailJob.recipient, emailJob.subject, emailJob.body);
        console.log(`Email sent for Job ${jobId}: ${info.messageId}`);

        // 5. Update DB State
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                sentAt: new Date(),
            },
        });

    } catch (error: any) {
        console.error(`Failed to send email for Job ${jobId}:`, error);

        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                // potentially store error message
            },
        });

        throw error; // Trigger BullMQ retry (exponential backoff)
    }
};

export const emailWorker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
    connection,
    concurrency: 5, // Process 5 jobs in parallel
    limiter: {
        max: 10, // Global explicit bottleneck (optional safeguard: max 10 jobs per second per worker)
        duration: 1000,
    },
});

// Event listeners for logging
emailWorker.on('completed', (job) => {
    console.log(`Queue Job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
    if (err.message.includes('RateLimit')) {
        console.log(`Queue Job ${job?.id} rate limited (rescheduled).`);
    } else {
        console.error(`Queue Job ${job?.id} failed: ${err.message}`);
    }
});
