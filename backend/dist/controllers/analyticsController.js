"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const prisma_1 = require("../db/prisma");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    // Count jobs by status
    // status: COMPLETED, PENDING, FAILED
    const [sent, pending, failed, total] = await Promise.all([
        prisma_1.prisma.job.count({ where: { senderId: userId, status: "COMPLETED" } }),
        prisma_1.prisma.job.count({ where: { senderId: userId, status: "PENDING" } }),
        prisma_1.prisma.job.count({ where: { senderId: userId, status: "FAILED" } }),
        prisma_1.prisma.job.count({ where: { senderId: userId } })
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
