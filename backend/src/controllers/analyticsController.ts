import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

import { asyncHandler } from '../utils/asyncHandler';

/**
 * Retrieves email job analytics (Global for Single User Mode).
 * Returns counts of sent, pending, and failed emails, plus success rate.
 */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {

    // Execute all count queries in parallel for performance
    const [sent, pending, failed, total] = await Promise.all([
        prisma.job.count({ where: { status: "SENT" } }),
        prisma.job.count({ where: { status: "PENDING" } }),
        prisma.job.count({ where: { status: "FAILED" } }),
        prisma.job.count()
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
