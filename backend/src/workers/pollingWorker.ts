import { prisma } from '../db/prisma';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { Job } from '@prisma/client';

const OAuth2 = google.auth.OAuth2;

/**
 * CONFIGURATION
 */
const POLLING_INTERVAL_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;

/**
 * Creates a Nodemailer transporter using OAuth2
 */
const createTransporter = async (user: any) => {
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
        refresh_token: user.refreshToken
    });

    try {
        // Automatically refreshes the access token if needed
        const accessTokenResponse = await oauth2Client.getAccessToken();
        const accessToken = accessTokenResponse?.token;

        if (!accessToken) throw new Error("Failed to generate Access Token");

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: user.email,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: user.refreshToken,
                accessToken: accessToken,
            },
        });
    } catch (error) {
        console.error(`❌ [Worker] Failed to create transporter for ${user.email}:`, error);
        throw error;
    }
};

/**
 * Processes a single job
 */
const processJob = async (job: Job & { user: any }) => {
    console.log(`📩 [Worker] Processing Job ID: ${job.id} for ${job.user.email}`);

    try {
        if (!job.user.refreshToken) {
            throw new Error("User has no Refresh Token. Re-login required.");
        }

        const transporter = await createTransporter(job.user);

        const info = await transporter.sendMail({
            from: `"${job.user.name || 'Cold Mail House'}" <${job.user.email}>`,
            to: job.recipient,
            subject: job.subject,
            html: job.body, // Assuming body is HTML
        });

        console.log(`✅ [Worker] Email Sent! Job ID: ${job.id}, Message ID: ${info.messageId}`);

        // Update Job Status
        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'SENT',
                sentAt: new Date(),
            }
        });

    } catch (error: any) {
        console.error(`❌ [Worker] Job ${job.id} Failed:`, error.message);

        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'FAILED',
                failureReason: error.message || 'Unknown Error',
            }
        });
    }
};

/**
 * Main Worker Loop
 */
const runWorker = async () => {
    console.log("👷 [Worker] Starting Polling Worker...");
    console.log(`   - Interval: ${POLLING_INTERVAL_MS}ms`);

    setInterval(async () => {
        try {
            const now = new Date();

            // 1. Fetch Due Jobs
            const dueJobs = await prisma.job.findMany({
                where: {
                    status: 'PENDING',
                    scheduledAt: { lte: now }
                },
                include: { user: true },
                take: 10 // Batch size
            });

            if (dueJobs.length === 0) {
                // console.log("💤 [Worker] No due jobs found.");
                return;
            }

            console.log(`🚀 [Worker] Found ${dueJobs.length} due jobs.`);

            // 2. Process Jobs in Parallel (or limit concurrency)
            await Promise.all(dueJobs.map(job => processJob(job)));

        } catch (error) {
            console.error("🔥 [Worker] Critical Loop Error:", error);
        }
    }, POLLING_INTERVAL_MS);
};

// Start the worker if this file is run directly
if (require.main === module) {
    runWorker();
}
