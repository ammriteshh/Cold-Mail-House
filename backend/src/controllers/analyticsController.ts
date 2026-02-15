import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

import { asyncHandler } from '../utils/asyncHandler';

/**
 * Retrieves email job analytics for the authenticated user.
 * Returns counts of sent, pending, and failed emails, plus success rate.
 */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;

    // Execute all count queries in parallel for performance
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
});
