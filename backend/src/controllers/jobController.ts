import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { emailQueue } from '../queues/emailQueue';

export const scheduleEmail = async (req: Request, res: Response) => {
    try {
        const { recipient, subject, body, scheduledAt } = req.body;
        const senderId = "default-user"; // Replace with actual auth user ID when available

        if (!recipient || !subject || !body || !senderId) {
            return res.status(400).json({ error: "Missing required fields" });
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
                jobId: job.id.toString()
            }
        );

        res.json({ message: "Email scheduled", jobId: job.id });

    } catch (error: any) {
        console.error("❌ Schedule email failed:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getJobs = async (req: Request, res: Response) => {
    try {
        const userId = "default-user";
        const jobs = await prisma.job.findMany({
            where: { senderId: userId },
            orderBy: { createdAt: "desc" },
            take: 20
        });
        res.json(jobs);
    } catch (error) {
        console.error("❌ Fetch jobs failed:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
};
