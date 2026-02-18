import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { emailQueue } from '../queues/emailQueue';

import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * Schedules a new email job.
 */
export const scheduleEmail = asyncHandler(async (req: Request, res: Response) => {
    try {
        console.log("📝 [DEBUG] /schedule-email called");
        console.log("   - Body:", req.body);
        console.log("   - User:", req.user);

        const { recipient, subject, body, scheduledAt } = req.body;

        // Safety Check: user must exist
        if (!req.user || !(req as any).user.id) {
            console.error("❌ [DEBUG] User is undefined in scheduleEmail");
            return res.status(401).json({ error: "Unauthorized: User session missing" });
        }

        const senderId = (req as any).user.id;

        if (!recipient || !subject || !body) {
            throw new AppError("Missing required fields: recipient, subject, or body", 400);
        }

        // Validate scheduledAt
        let scheduleDate = new Date();
        if (scheduledAt) {
            const parsedDate = new Date(scheduledAt);
            if (!isNaN(parsedDate.getTime())) {
                scheduleDate = parsedDate;
            } else {
                console.warn("⚠️ [DEBUG] Invalid scheduledAt date provided, defaulting to now:", scheduledAt);
            }
        }

        console.log("   - Creating Job for sender:", senderId);

        // 1. Create job in DB
        const job = await prisma.job.create({
            data: {
                recipient,
                subject,
                body,
                senderId,
                scheduledAt: scheduleDate,
                status: "PENDING"
            }
        });

        console.log("   - Job Created ID:", job.id);

        // 2. Calculate delay in milliseconds
        const delay = scheduleDate.getTime() - Date.now();

        // 3. Add to BullMQ queue
        try {
            await emailQueue.add(
                "send-email",
                { jobId: job.id },
                {
                    delay: Math.max(0, delay),
                    removeOnComplete: true,
                    removeOnFail: false, // Keep failed jobs for inspection
                    jobId: job.id.toString() // Deduplication if needed
                }
            );
        } catch (queueError) {
            console.error("❌ [CRITICAL] Failed to add job to queue (Redis down?):", queueError);
            // Verify if we should throw or just warn. 
            // If queue is down, job is in DB (PENDING). We can potentially pick it up later.
            // For now, let's warn user but return success (Job is saved).
            return res.status(201).json({
                message: "Email saved but scheduling failed (Queue issue). It will be retried later.",
                jobId: job.id,
                warning: "Queue unavailable"
            });
        }

        res.status(201).json({
            message: "Email scheduled successfully",
            jobId: job.id
        });
    } catch (error) {
        console.error("🔥 [CRITICAL] Error in scheduleEmail:", error);
        throw error; // Re-throw to be handled by global error handler
    }
});

/**
 * Retrieves the list of jobs for the authenticated user.
 */
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;

    const jobs = await prisma.job.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "desc" },
        take: 20
    });

    res.json(jobs);
});
