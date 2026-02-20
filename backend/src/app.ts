
import express from "express";
import cors from "cors";
import "dotenv/config";
import jobRoutes from "./routes/jobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import { globalErrorHandler } from "./middleware/errorHandler";

const app = express();

/**
 * =======================
 * 🛠️ MIDDLEWARE
 * =======================
 */
app.use(express.json());

// Trust Proxy for Render/Heroku
app.set('trust proxy', 1);

// CORS Configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);

/**
 * =======================
 * 🛣️ ROUTES
 * =======================
 */

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Auth Routes (Single User Mode — no real session needed)
app.use("/auth", authRoutes);

// Job & Analytics Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);

/**
 * =======================
 * ⚠️ ERROR HANDLING
 * =======================
 */
app.use(globalErrorHandler);

export { app };
