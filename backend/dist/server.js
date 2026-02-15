"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const emailQueue_1 = require("./queues/emailQueue");
const emailWorker_1 = require("./workers/emailWorker"); // starts worker
/**
 * =======================
 * 🚀 SERVER STARTUP
 * =======================
 */
const PORT = config_1.config.port;
const server = app_1.app.listen(PORT, () => {
    console.log(`\n===================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config_1.config.env}`);
    console.log(`📨 Email Worker: ACTIVE`);
    console.log(`===================================\n`);
});
/**
 * Graceful Shutdown Handling
 */
const gracefulShutdown = async () => {
    console.log('\n🛑 SIGTERM/SIGINT received. Shutting down gracefully...');
    try {
        await emailQueue_1.emailQueue.close();
        await emailWorker_1.emailWorker.close();
        console.log('✅ Queues and Workers closed');
        server.close(() => {
            console.log('✅ HTTP Server closed');
            process.exit(0);
        });
    }
    catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
