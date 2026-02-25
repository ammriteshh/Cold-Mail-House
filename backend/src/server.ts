import { app } from "./app";
import { config } from "./config";
import { emailQueue } from "./queues/emailQueue";
import { emailWorker } from "./workers/emailWorker"; // starts BullMQ worker
import { startPollingWorker } from "./workers/pollingWorker"; // starts polling fallback
import { checkResendConfig } from "./services/emailService";

const PORT = config.port;

const server = app.listen(PORT, async () => {
    console.log(`[Server] Running on port ${PORT} (${config.env})`);
    console.log(`[Server] Background workers initialized`);

    // Verify Resend configuration
    const resendStatus = checkResendConfig();
    if (!resendStatus.ok) {
        console.warn(`[Config] Missing RESEND_API_KEY. Outbound delivery will be disabled.`);
    } else {
        console.log(`[Config] Resend verified. Active from: ${resendStatus.from}`);
    }
});

/**
 * Graceful Shutdown Handling
 */
const gracefulShutdown = async () => {
    console.log('[Server] Shutdown signal received. Closing connections...');

    try {
        await emailQueue.close();
        await emailWorker.close();
        console.log('[Server] Queues closed');

        server.close(() => {
            console.log('[Server] HTTP server stopped');
            process.exit(0);
        });
    } catch (err) {
        console.error('[Server] Shutdown error:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
