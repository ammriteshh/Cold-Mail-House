"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
exports.app = app;
/* =====================
   MIDDLEWARE
   ===================== */
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow all origins for diagnosis - in strictly secure environments, list them explicitly.
        // But for this SaaS, we want to ensure the frontend can reach it.
        callback(null, true);
    },
    credentials: true
}));
/* =====================
   ROUTES
   ===================== */
app.use("/auth", authRoutes_1.default); // Public auth routes
// Protected routes
app.use("/", authMiddleware_1.authenticateUser, jobRoutes_1.default);
app.use("/api", authMiddleware_1.authenticateUser, analyticsRoutes_1.default);
/* =====================
   GLOBAL ERROR HANDLER
   ===================== */
app.use(errorHandler_1.globalErrorHandler);
