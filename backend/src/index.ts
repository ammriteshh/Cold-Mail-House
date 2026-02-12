import express from "express";
import cors from "cors";
import "dotenv/config";


import { emailQueue } from "./queues/emailQueue";
import { prisma } from "./db/prisma";
import { emailWorker } from "./workers/emailWorker"; // starts worker

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

if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error("❌ ACCESS_TOKEN_SECRET is missing");
}

if (!process.env.REFRESH_TOKEN_SECRET) {
    console.error("❌ REFRESH_TOKEN_SECRET is missing");
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

/* =====================
   ROUTES
===================== */
import jobRoutes from "./routes/jobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateUser } from "./middleware/authMiddleware";

app.use("/auth", authRoutes); // Public auth routes

// Protected routes
app.use("/", authenticateUser, jobRoutes);
app.use("/api", authenticateUser, analyticsRoutes);

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

    const gracefulShutdown = async () => {
        console.log('🛑 Shutting down gracefully...');
        await emailQueue.close();
        await emailWorker.close();
        process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
});
