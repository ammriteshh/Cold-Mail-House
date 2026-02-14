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

const checkSenderRateLimit = async (senderId: string, jobId: number, job: Job) => {
    const currentHour = new Date().toISOString().slice(0, 13); // Format: "YYYY-MM-DDTHH"
    const rateLimitKey = `rate-limit:sender:${senderId}:${currentHour}`;

    const currentCount = await connection.incr(rateLimitKey);
    if (currentCount === 1) {
        await connection.expire(rateLimitKey, 3600 + 60);
    }

    if (currentCount > config.rateLimit.maxPerSenderPerHour) {
        console.warn(`Rate limit exceeded for sender ${senderId}. Rescheduling Job ${jobId}.`);
        const delay = getNextHourDelay();
        await job.moveToDelayed(Date.now() + delay, job.token);
        throw new Error(`RateLimit: Moved to delayed (Queue Order)`);
    }
};

const updateJobStatus = async (jobId: number, status: 'COMPLETED' | 'FAILED', failureReason?: string) => {
    await prisma.job.update({
        where: { id: jobId },
        data: {
            status,
            ...(status === 'COMPLETED' ? { sentAt: new Date() } : { failureReason }),
        },
    });
};

const processEmailJob = async (job: Job) => {
    const { jobId } = job.data;

    const emailJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (!emailJob) {
        console.error(`Job ${jobId} not found in DB`);
        return;
    }

    if (emailJob.status === 'COMPLETED') {
        console.log(`Job ${jobId} already COMPLETED. Skipping.`);
        return;
    }

    await checkSenderRateLimit(emailJob.senderId, jobId, job);

    try {
        const info = await sendEmail(emailJob.recipient, emailJob.subject, emailJob.body);
        console.log(`Email sent for Job ${jobId}: ${info.messageId}`);
        await updateJobStatus(jobId, 'COMPLETED');
    } catch (error: any) {
        console.error(`Failed to send email for Job ${jobId}:`, error);
        await updateJobStatus(jobId, 'FAILED', error.message || 'Unknown error');
        throw error;
    }
};

export const emailWorker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
    connection,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
});

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
