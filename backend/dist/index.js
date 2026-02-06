"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailQueue_1 = require("./queues/emailQueue");
const prisma_1 = require("./db/prisma");
require("./workers/emailWorker"); // Import to start the worker
const config_1 = require("./config");
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("./config/passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' })); // Allow Frontend
app.use(passport_1.default.initialize());
// Auth Routes
app.use('/auth', auth_1.default);
app.get('/jobs', auth_2.authenticateJWT, async (req, res) => {
    try {
        const jobs = await prisma_1.prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
app.post('/schedule-email', auth_2.authenticateJWT, async (req, res) => {
    try {
        const { recipient, subject, body, senderId, scheduledAt } = req.body;
        if (!recipient || !subject || !body || !senderId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // 1. Create Job in Database
        const job = await prisma_1.prisma.job.create({
            data: {
                recipient,
                subject,
                body,
                senderId,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
                status: 'PENDING',
            },
        });
        // 2. Calculate Delay
        const delay = scheduledAt ? new Date(scheduledAt).getTime() - Date.now() : 0;
        // 3. Add to BullMQ
        await emailQueue_1.emailQueue.add('send-email', { jobId: job.id }, {
            delay: Math.max(0, delay),
            removeOnComplete: true,
            jobId: job.id.toString() // Use DB ID as BullMQ Job ID for deduplication if needed
        });
        res.json({ message: 'Email scheduled', jobId: job.id });
    }
    catch (error) {
        console.error('Error scheduling email:', error);
        res.status(500).json({ error: error.message });
    }
});
app.listen(config_1.config.port, () => {
    console.log(`Server running on port ${config_1.config.port}`);
    console.log(`Worker is processing jobs...`);
});
