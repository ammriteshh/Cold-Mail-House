import express from "express";
import cors from "cors";
import "dotenv/config";
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

import { emailQueue } from "./queues/emailQueue";
import { prisma } from "./db/prisma";
import "./workers/emailWorker"; // starts worker
// import passport from "./config/passport"; // REMOVED
// import authRoutes from "./routes/auth"; // REMOVED
// import { authenticateJWT } from "./middleware/auth"; // REMOVED
import { clerkMiddleware } from "./middleware/clerk";

const app = express();

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
app.use(express.json());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? ["https://cold-mail-house-1.onrender.com", "https://cold-mail-house.onrender.com"] : "http://localhost:5173"),
        credentials: true
    })
);

// app.use(passport.initialize()); // REMOVED
app.use(clerkMiddleware as any);

/* =====================
   ROUTES
===================== */
// app.use("/auth", authRoutes); // REMOVED

app.get("/jobs", ClerkExpressRequireAuth() as any, async (req: any, res: any) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { senderId: req.auth.userId }, // Filter by logged-in user
            orderBy: { createdAt: "desc" },
            take: 20
        });
        res.json(jobs);
    } catch (error) {
        console.error("❌ Fetch jobs failed:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

app.post("/schedule-email", ClerkExpressRequireAuth() as any, async (req: any, res: any) => {
    try {
        const { recipient, subject, body, scheduledAt } = req.body;
        const senderId = req.auth.userId; // Securely get from Clerk

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
});

/* =====================
   GLOBAL ERROR HANDLER
===================== */
app.use((err: any, req: any, res: any, next: any) => {
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
