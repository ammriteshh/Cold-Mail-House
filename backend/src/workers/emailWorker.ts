import { Worker, Job } from 'bullmq';
import connection from '../config/redis';
import { prisma } from '../db/prisma';
import { sendEmail } from '../services/emailService';
import { config } from '../config';
import { EMAIL_QUEUE_NAME } from '../queues/emailQueue';

const ONE_HOUR_SECONDS = 3600;
const RATE_LIMIT_WINDOW = ONE_HOUR_SECONDS + 60; // slightly more than an hour

/**
 * Helper to get the start of the next hour in milliseconds.
 */
const getNextHourDelay = (): number => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Top of next hour
    return nextHour.getTime() - now.getTime();
};

/**
 * Checks if the sender has exceeded their hourly rate limit.
 */
/**
 * Updates the job status in the database.
 */
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
        console.error(`Failed to update job status for Job ${jobId}:`, error);
    }
};

/**
 * Main processor for email jobs.
 */
const processEmailJob = async (job: Job) => {
    const { jobId } = job.data; // Now using numeric ID directly if passed, or matching job creation

    // Job ID from BullMQ might be different from DB ID if we didn't force it, but our controller forces it.
    // However, the controller passes { jobId: job.id } in data.
    const dbJobId = typeof jobId === 'string' && jobId.startsWith('job-') ? parseInt(jobId.split('-')[1]) : jobId;

    const emailJob = await prisma.job.findUnique({ where: { id: parseInt(String(dbJobId)) } });

    if (!emailJob) {
        console.error(`Job ${jobId} not found in DB`);
        return;
    }

    if (emailJob.status === 'COMPLETED') {
        console.log(`Job ${jobId} already COMPLETED. Skipping.`);
        return;
    }

    // Single User Mode: No sender rate limit check needed here (or global limit can be applied if needed)

    try {
        const info = await sendEmail(emailJob.recipient, emailJob.subject, emailJob.body);
        console.log(`✅ Email sent for Job ${jobId}. Resend ID: ${info.id}`);
        await updateJobStatus(emailJob.id, 'COMPLETED');
    } catch (error: any) {
        console.error(`Failed to send email for Job ${jobId}:`, error);
        await updateJobStatus(emailJob.id, 'FAILED', error.message || 'Unknown error');
        throw error; // Rethrow to let BullMQ handle retry/failure logic
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

// emailWorker.on('completed', (job) => {
//     console.log(`Queue Job ${job.id} completed!`);
// });

emailWorker.on('failed', (job, err) => {
    if (err.message.includes('RateLimit')) {
        console.log(`Queue Job ${job?.id} rate limited (rescheduled).`);
    } else {
        console.error(`Queue Job ${job?.id} failed: ${err.message}`);
    }
});
