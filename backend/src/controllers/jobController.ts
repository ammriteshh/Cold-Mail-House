import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { emailQueue } from '../queues/emailQueue';

import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * Schedules a new email job.
 */
export const scheduleEmail = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { recipient, subject, body, scheduledAt, idempotencyKey } = req.body;

        // Basic validation
        if (!recipient || !subject || !body || !scheduledAt) {
            throw new AppError('Missing required fields: recipient, subject, body, scheduledAt', 400);
        }

        // Prevent duplicates if key provided
        if (idempotencyKey) {
            const existingJob = await prisma.job.findUnique({
                where: { idempotencyKey },
            });
            if (existingJob) {
                return res.status(200).json({ status: 'success', data: existingJob, message: 'Job already exists (idempotent)' });
            }
        }

        // Validate scheduledAt
        let scheduleDate = new Date();
        const parsedDate = new Date(scheduledAt);
        if (!isNaN(parsedDate.getTime())) {
            scheduleDate = parsedDate;
        }

        // Create Job in DB
        const job = await prisma.job.create({
            data: {
                recipient,
                subject,
                body,
                scheduledAt: scheduleDate,
                idempotencyKey,
            },
        });

        // Calculate delay
        const delay = scheduleDate.getTime() - Date.now();

        // Add to BullMQ
        try {
            const bullMqJob = await emailQueue.add(
                "send-email",
                { jobId: job.id },
                {
                    delay: Math.max(0, delay),
                    removeOnComplete: true,
                    jobId: `job-${job.id}`
                }
            );

            // Update DB with BullMQ ID
            await prisma.job.update({
                where: { id: job.id },
                data: { bullMqJobId: bullMqJob.id }
            });

        } catch (queueError) {
            console.error("❌ [CRITICAL] Failed to add job to queue:", queueError);
            return res.status(201).json({
                message: "Email saved but scheduling failed (Queue issue). It will be retried later.",
                jobId: job.id,
                warning: "Queue unavailable"
            });
        }

        res.status(201).json({
            message: "Email scheduled successfully",
            jobId: job.id,
            status: 'success',
            data: job
        });
    } catch (error) {
        throw error;
    }
});

// Get all jobs (Single User Mode: Returns all jobs)
export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for safety
        });

        res.status(200).json({ status: 'success', results: jobs.length, data: jobs });
    } catch (error) {
        next(error);
    }
};

/**
 * DEBUG: Get all pending jobs that are due
 */
export const getPendingJobs = asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const dueJobs = await prisma.job.findMany({
        where: {
            status: 'PENDING',
            scheduledAt: { lte: now }
        }
    });

    res.json({
        count: dueJobs.length,
        serverTime: now,
        jobs: dueJobs
    });
});

