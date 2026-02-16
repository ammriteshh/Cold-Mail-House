"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const pg_1 = require("pg");
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
require("./config/passport"); // Initialize passport config
const app = (0, express_1.default)();
exports.app = app;
const pgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
// Database pool for session store
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
/**
 * =======================
 * 🛠️ MIDDLEWARE
 * =======================
 */
app.use(express_1.default.json());
// CORS Configuration
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow all origins for diagnosis. 
        // In production, simpler logic or strict allowlist can be applied here.
        callback(null, true);
    },
    credentials: true
}));
// Session Configuration
app.use((0, express_session_1.default)({
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
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
/**
 * =======================
 * 🛣️ ROUTES
 * =======================
 */
// Public Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use("/auth", authRoutes_1.default);
// Protected Routes
app.use("/", authMiddleware_1.authenticateUser, jobRoutes_1.default);
app.use("/api", authMiddleware_1.authenticateUser, analyticsRoutes_1.default);
/**
 * =======================
 * ⚠️ ERROR HANDLING
 * =======================
 */
app.use(errorHandler_1.globalErrorHandler);
