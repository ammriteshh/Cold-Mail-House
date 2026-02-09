"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const emailQueue_1 = require("./queues/emailQueue");
const prisma_1 = require("./db/prisma");
require("./workers/emailWorker"); // starts worker
const app = (0, express_1.default)();
/* =====================
   ENV SAFETY CHECKS
===================== */
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing");
}
if (!process.env.REDIS_URL) {
    console.error("❌ REDIS_URL is missing");
}
/* =====================
   MIDDLEWARE
===================== */
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? ["https://cold-mail-house-1.onrender.com", "https://cold-mail-house.onrender.com"] : "http://localhost:5173"),
    credentials: true
}));
/* =====================
   ROUTES
===================== */
app.get("/jobs", async (req, res) => {
    try {
        const userId = "default-user";
        const jobs = await prisma_1.prisma.job.findMany({
            where: { senderId: userId }, // Filter by logged-in user
            orderBy: { createdAt: "desc" },
            take: 20
        });
        res.json(jobs);
    }
    catch (error) {
        console.error("❌ Fetch jobs failed:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});
app.post("/schedule-email", async (req, res) => {
    try {
        const { recipient, subject, body, scheduledAt } = req.body;
        const senderId = "default-user";
        if (!recipient || !subject || !body || !senderId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // 1️⃣ Create job in DB
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
        // 2️⃣ Calculate delay
        const delay = scheduledAt
            ? new Date(scheduledAt).getTime() - Date.now()
            : 0;
        // 3️⃣ Queue email
        await emailQueue_1.emailQueue.add("send-email", { jobId: job.id }, {
            delay: Math.max(0, delay),
            removeOnComplete: true,
            jobId: job.id.toString()
        });
        res.json({ message: "Email scheduled", jobId: job.id });
    }
    catch (error) {
        console.error("❌ Schedule email failed:", error);
        res.status(500).json({ error: error.message });
    }
});
/* =====================
   GLOBAL ERROR HANDLER
===================== */
app.use((err, req, res, next) => {
    console.error("🔥 UNHANDLED ERROR:", err.stack || err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});
/* =====================
   START SERVER (RENDER SAFE)
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("📨 Email worker active");
});
