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

        if (!recipient || !subject || !body || !scheduledAt) {
            throw new AppError('Missing required fields: recipient, subject, body, or scheduledAt', 400);
        }

        if (idempotencyKey) {
            const existingJob = await prisma.job.findUnique({
                where: { idempotencyKey },
            });
            if (existingJob) {
                return res.status(200).json({ status: 'success', data: existingJob, message: 'Request already processed' });
            }
        }

        const parsedDate = new Date(scheduledAt);
        const scheduleDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

        const newJob = await prisma.job.create({
            data: {
                recipient,
                subject,
                body,
                scheduledAt: scheduleDate,
                idempotencyKey,
            },
        });

        const delay = Math.max(0, scheduleDate.getTime() - Date.now());

        try {
            const queueJob = await emailQueue.add(
                "send-email",
                { jobId: newJob.id },
                {
                    delay,
                    removeOnComplete: true,
                    jobId: `job-${newJob.id}`
                }
            );

            await prisma.job.update({
                where: { id: newJob.id },
                data: { bullMqJobId: queueJob.id }
            });

        } catch (queueError) {
            console.error("[JobController] Failed to add job to queue:", queueError);
            return res.status(201).json({
                message: "Email record saved, but scheduling failed. It will be picked up by the fallback worker.",
                jobId: newJob.id,
                warning: "Scheduling delay"
            });
        }

        res.status(201).json({
            status: 'success',
            message: "Email scheduled successfully",
            jobId: newJob.id,
            data: newJob
        });
    } catch (error) {
        throw error;
    }
});

// Lists historical and scheduled jobs
export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        res.status(200).json({ status: 'success', results: jobs.length, data: jobs });
    } catch (error) {
        next(error);
    }
};

// Internal diagnostics for pending jobs
export const getPendingJobs = asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const pendingJobs = await prisma.job.findMany({
        where: {
            status: 'PENDING',
            scheduledAt: { lte: now }
        }
    });

    res.json({
        count: pendingJobs.length,
        serverTime: now,
        jobs: pendingJobs
    });
});

