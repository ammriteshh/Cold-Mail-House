import express from "express";
import cors from "cors";
import "dotenv/config";
import jobRoutes from "./routes/jobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateUser } from "./middleware/authMiddleware";
import { globalErrorHandler } from "./middleware/errorHandler";
import { config } from "./config";

const app = express();

/**
 * =======================
 * 🛠️ MIDDLEWARE
 * =======================
 */
app.use(express.json());

// CORS Configuration
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins for diagnosis. 
            // In production, simpler logic or strict allowlist can be applied here.
            callback(null, true);
        },
        credentials: true
    })
);

/**
 * =======================
 * 🛣️ ROUTES
 * =======================
 */

// Public Routes
app.use("/auth", authRoutes);

// Protected Routes
app.use("/", authenticateUser, jobRoutes);
app.use("/api", authenticateUser, analyticsRoutes);

/**
 * =======================
 * ⚠️ ERROR HANDLING
 * =======================
 */
app.use(globalErrorHandler);

export { app };
