import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        // Count jobs by status
        // status: COMPLETED, PENDING, FAILED
        const [sent, pending, failed, total] = await Promise.all([
            prisma.job.count({ where: { senderId: userId, status: "COMPLETED" } }),
            prisma.job.count({ where: { senderId: userId, status: "PENDING" } }),
            prisma.job.count({ where: { senderId: userId, status: "FAILED" } }),
            prisma.job.count({ where: { senderId: userId } })
        ]);

        const successRate = sent + failed > 0
            ? Math.round((sent / (sent + failed)) * 100)
            : 0;

        res.json({
            totalEmails: total,
            totalSent: sent,
            totalPending: pending,
            totalFailed: failed,
            successRate
        });
    } catch (error) {
        console.error("❌ Fetch analytics failed:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};
