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

/* =====================
   MIDDLEWARE
   ===================== */
app.use(express.json());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins for diagnosis - in strictly secure environments, list them explicitly.
            // But for this SaaS, we want to ensure the frontend can reach it.
            callback(null, true);
        },
        credentials: true
    })
);

/* =====================
   ROUTES
   ===================== */
app.use("/auth", authRoutes); // Public auth routes

// Protected routes
app.use("/", authenticateUser, jobRoutes);
app.use("/api", authenticateUser, analyticsRoutes);

/* =====================
   GLOBAL ERROR HANDLER
   ===================== */
app.use(globalErrorHandler);

export { app };
