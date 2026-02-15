
import express from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import passport from "passport";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import jobRoutes from "./routes/jobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateUser } from "./middleware/authMiddleware";
import { globalErrorHandler } from "./middleware/errorHandler";
import "./config/passport"; // Initialize passport config

const app = express();
const pgStore = pgSession(session);

// Database pool for session store
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

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

// Session Configuration
app.use(
    session({
        store: new pgStore({
            pool: pool,
            tableName: "session", // Use default table name 'session'
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET || "supersecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // secure in prod
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

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
