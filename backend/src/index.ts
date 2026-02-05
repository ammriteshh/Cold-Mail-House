import express from 'express';
import { emailQueue } from './queues/emailQueue';
import { prisma } from './db/prisma';
import './workers/emailWorker'; // Import to start the worker
import { config } from './config';

import cors from 'cors';

import passport from './config/passport';
import authRoutes from './routes/auth';
import { authenticateJWT } from './middleware/auth';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' })); // Allow Frontend
app.use(passport.initialize());

// Auth Routes
app.use('/auth', authRoutes);

app.get('/jobs', authenticateJWT, async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.post('/schedule-email', authenticateJWT, async (req, res) => {
    try {
        const { recipient, subject, body, senderId, scheduledAt } = req.body;

        if (!recipient || !subject || !body || !senderId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // 1. Create Job in Database
        const job = await prisma.job.create({
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
        await emailQueue.add('send-email', { jobId: job.id }, {
            delay: Math.max(0, delay),
            removeOnComplete: true,
            jobId: job.id.toString() // Use DB ID as BullMQ Job ID for deduplication if needed
        });

        res.json({ message: 'Email scheduled', jobId: job.id });

    } catch (error: any) {
        console.error('Error scheduling email:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Worker is processing jobs...`);
});
