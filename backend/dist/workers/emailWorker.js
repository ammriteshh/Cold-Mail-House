"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const prisma_1 = require("../db/prisma");
const emailService_1 = require("../services/emailService");
const config_1 = require("../config");
const emailQueue_1 = require("../queues/emailQueue");
const ONE_HOUR_SECONDS = 3600;
const RATE_LIMIT_WINDOW = ONE_HOUR_SECONDS + 60; // slightly more than an hour
/**
 * Helper to get the start of the next hour in milliseconds.
 */
const getNextHourDelay = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Top of next hour
    return nextHour.getTime() - now.getTime();
};
/**
 * Checks if the sender has exceeded their hourly rate limit.
 */
const checkSenderRateLimit = async (senderId, jobId, job) => {
    const currentHour = new Date().toISOString().slice(0, 13); // Format: "YYYY-MM-DDTHH"
    const rateLimitKey = `rate-limit:sender:${senderId}:${currentHour}`;
    const currentCount = await redis_1.default.incr(rateLimitKey);
    // Set expiry on first increment
    if (currentCount === 1) {
        await redis_1.default.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }
    if (currentCount > config_1.config.rateLimit.maxPerSenderPerHour) {
        console.warn(`Rate limit exceeded for sender ${senderId}. Rescheduling Job ${jobId}.`);
        const delay = getNextHourDelay();
        await job.moveToDelayed(Date.now() + delay, job.token);
        throw new Error(`RateLimit: Moved to delayed (Queue Order)`);
    }
};
/**
 * Updates the job status in the database.
 */
const updateJobStatus = async (jobId, status, failureReason) => {
    try {
        await prisma_1.prisma.job.update({
            where: { id: jobId },
            data: {
                status,
                ...(status === 'COMPLETED' ? { sentAt: new Date() } : { failureReason }),
            },
        });
    }
    catch (error) {
        console.error(`Failed to update job status for Job ${jobId}:`, error);
    }
};
/**
 * Main processor for email jobs.
 */
const processEmailJob = async (job) => {
    const { jobId } = job.data;
    const emailJob = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
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
        const info = await (0, emailService_1.sendEmail)(emailJob.recipient, emailJob.subject, emailJob.body);
        console.log(`Email sent for Job ${jobId}: ${info.messageId}`);
        await updateJobStatus(jobId, 'COMPLETED');
    }
    catch (error) {
        console.error(`Failed to send email for Job ${jobId}:`, error);
        await updateJobStatus(jobId, 'FAILED', error.message || 'Unknown error');
        throw error; // Rethrow to let BullMQ handle retry/failure logic
    }
};
exports.emailWorker = new bullmq_1.Worker(emailQueue_1.EMAIL_QUEUE_NAME, processEmailJob, {
    connection: redis_1.default,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
});
exports.emailWorker.on('completed', (job) => {
    console.log(`Queue Job ${job.id} completed!`);
});
exports.emailWorker.on('failed', (job, err) => {
    if (err.message.includes('RateLimit')) {
        console.log(`Queue Job ${job?.id} rate limited (rescheduled).`);
    }
    else {
        console.error(`Queue Job ${job?.id} failed: ${err.message}`);
    }
});
