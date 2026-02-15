"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = exports.scheduleEmail = void 0;
const prisma_1 = require("../db/prisma");
const emailQueue_1 = require("../queues/emailQueue");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
/**
 * Schedules a new email job.
 */
exports.scheduleEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { recipient, subject, body, scheduledAt } = req.body;
    const senderId = req.user.userId;
    if (!recipient || !subject || !body) {
        throw new AppError_1.AppError("Missing required fields: recipient, subject, or body", 400);
    }
    // 1. Create job in DB
    const job = await prisma_1.prisma.job.create({
        data: {
            recipient,
            subject,
            body,
            senderId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            status: "PENDING"
        }
    });
    // 2. Calculate delay in milliseconds
    const delay = scheduledAt
        ? new Date(scheduledAt).getTime() - Date.now()
        : 0;
    // 3. Add to BullMQ queue
    await emailQueue_1.emailQueue.add("send-email", { jobId: job.id }, {
        delay: Math.max(0, delay),
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for inspection
        jobId: job.id.toString() // Deduplication if needed
    });
    res.status(201).json({
        message: "Email scheduled successfully",
        jobId: job.id
    });
});
/**
 * Retrieves the list of jobs for the authenticated user.
 */
exports.getJobs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const jobs = await prisma_1.prisma.job.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "desc" },
        take: 20
    });
    res.json(jobs);
});
