import { Response } from 'express';
import { prisma } from '../db/prisma';
import { emailQueue } from '../queues/emailQueue';
import { AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const scheduleEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { recipient, subject, body, scheduledAt } = req.body;
    const senderId = req.user!.userId;

    if (!recipient || !subject || !body) {
        throw new AppError("Missing required fields: recipient, subject, or body", 400);
    }

    // 1️⃣ Create job in DB
    const job = await prisma.job.create({
        data: {
            recipient,
            subject,
            body,
            senderId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            status: "PENDING"
        }
    });

    // 2️⃣ Calculate delay
    const delay = scheduledAt
        ? new Date(scheduledAt).getTime() - Date.now()
        : 0;

    // 3️⃣ Queue email
    await emailQueue.add(
        "send-email",
        { jobId: job.id },
        {
            delay: Math.max(0, delay),
            removeOnComplete: true,
            removeOnFail: false,
            jobId: job.id.toString()
        }
    );

    res.status(201).json({ message: "Email scheduled successfully", jobId: job.id });
});

export const getJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const jobs = await prisma.job.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "desc" },
        take: 20
    });
    res.json(jobs);
});
