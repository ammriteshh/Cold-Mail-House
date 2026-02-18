
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

// Trust Proxy for Render/Heroku (Required for secure cookies behind split load balancers)
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.LOCAL_FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean) as string[];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`Blocked CORS for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    })
);

// Session Configuration
app.use(
    session({
        store: new pgStore({
            pool: pool,
            tableName: "session",
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET || "supersecret",
        resave: false,
        saveUninitialized: false,
        proxy: true, // Required for Heroku/Render to set secure cookies
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN || '.onrender.com' : undefined
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
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

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
