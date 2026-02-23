import { app } from "./app";
import { config } from "./config";
import { emailQueue } from "./queues/emailQueue";
import { emailWorker } from "./workers/emailWorker"; // starts BullMQ worker
import { startPollingWorker } from "./workers/pollingWorker"; // starts polling fallback
import { checkResendConfig } from "./services/emailService";

/**
 * =======================
 * 🚀 SERVER STARTUP
 * =======================
 */
const PORT = config.port;

const server = app.listen(PORT, async () => {
    console.log(`\n===================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.env}`);
    console.log(`📨 Email Worker: ACTIVE`);
    console.log(`===================================\n`);

    // Start polling worker (checks DB every 30s for due PENDING jobs)
    startPollingWorker();

    // Verify Resend configuration on startup
    const resendStatus = checkResendConfig();
    if (!resendStatus.ok) {
        console.warn(`\n⚠️  RESEND WARNING: RESEND_API_KEY is not set.`);
        console.warn(`   Emails will FAIL until this is resolved.\n`);
    } else {
        console.log(`✅ Resend ready — sending from: ${resendStatus.from}`);
    }
});

/**
 * Graceful Shutdown Handling
 */
const gracefulShutdown = async () => {
    console.log('\n🛑 SIGTERM/SIGINT received. Shutting down gracefully...');

    try {
        await emailQueue.close();
        await emailWorker.close();
        console.log('✅ Queues and Workers closed');

        server.close(() => {
            console.log('✅ HTTP Server closed');
            process.exit(0);
        });
    } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
