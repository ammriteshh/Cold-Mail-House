"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const emailQueue_1 = require("./queues/emailQueue");
const emailWorker_1 = require("./workers/emailWorker"); // starts worker
/* =====================
   START SERVER
   ===================== */
const PORT = config_1.config.port;
const server = app_1.app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${config_1.config.env} mode`);
    console.log("📨 Email worker active");
});
const gracefulShutdown = async () => {
    console.log('🛑 Shutting down gracefully...');
    await emailQueue_1.emailQueue.close();
    await emailWorker_1.emailWorker.close();
    server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
