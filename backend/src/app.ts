
import express from "express";
import cors from "cors";
import "dotenv/config";
import jobRoutes from "./routes/jobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
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

// Public Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Protected Routes (Simplified: Single User Mode)
// For now, we will leave these open or add a simple header check later.
// The frontend will just hit these directly.
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);

/**
 * =======================
 * ⚠️ ERROR HANDLING
 * =======================
 */
// End of file
