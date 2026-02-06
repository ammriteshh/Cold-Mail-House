"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    email: {
        host: 'smtp.ethereal.email',
        port: 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    rateLimit: {
        maxPerSenderPerHour: 100, // Default limit
    },
};
