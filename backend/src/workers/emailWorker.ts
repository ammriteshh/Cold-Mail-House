import { Worker, Job } from 'bullmq';
import connection from '../config/redis';
import { prisma } from '../db/prisma';
import { sendEmail } from '../services/emailService';
import { config } from '../config';
import { EMAIL_QUEUE_NAME } from '../queues/emailQueue';

const ONE_HOUR_SECONDS = 3600;
const RATE_LIMIT_WINDOW = ONE_HOUR_SECONDS + 60; // slightly more than an hour

const getNextHourDelay = (): number => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.getTime() - now.getTime();
};

const updateJobStatus = async (jobId: number, status: 'COMPLETED' | 'FAILED', failureReason?: string) => {
    try {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status,
                ...(status === 'COMPLETED' ? { sentAt: new Date() } : { failureReason }),
            },
        });
    } catch (error) {
        console.error(`[Worker] Failed to update job status for ID ${jobId}:`, error);
    }
};

const processEmailJob = async (job: Job) => {
    const { jobId } = job.data;
    const dbJobId = typeof jobId === 'string' && jobId.startsWith('job-')
        ? parseInt(jobId.split('-')[1])
        : parseInt(String(jobId));

    const emailJob = await prisma.job.findUnique({ where: { id: dbJobId } });

    if (!emailJob) {
        console.error(`[Worker] Job ${jobId} not found in database`);
        return;
    }

    if (emailJob.status === 'COMPLETED') {
        console.log(`[Worker] Job ${jobId} already completed. Skipping.`);
        return;
    }

    // Single User Mode: No sender rate limit check needed here (or global limit can be applied if needed)

    try {
        const info = await sendEmail(emailJob.recipient, emailJob.subject, emailJob.body);
        console.log(`[Worker] Email dispatched for Job ${jobId}. External ID: ${info.id}`);
        await updateJobStatus(emailJob.id, 'COMPLETED');
    } catch (error: any) {
        console.error(`[Worker] Failed to dispatch email for Job ${jobId}:`, error.message);
        await updateJobStatus(emailJob.id, 'FAILED', error.message || 'Unknown delivery failure');
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

emailWorker.on('failed', (job, err) => {
    if (err.message.includes('RateLimit')) {
        console.log(`[Worker] Queue Job ${job?.id} rate limited (rescheduled).`);
    } else {
        console.error(`[Worker] Queue Job ${job?.id} failed: ${err.message}`);
    }
});
