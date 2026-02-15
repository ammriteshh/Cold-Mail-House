import { app } from "./app";
import { config } from "./config";
import { emailQueue } from "./queues/emailQueue";
import { emailWorker } from "./workers/emailWorker"; // starts worker

/**
 * =======================
 * 🚀 SERVER STARTUP
 * =======================
 */
const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`\n===================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.env}`);
    console.log(`📨 Email Worker: ACTIVE`);
    console.log(`===================================\n`);
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
