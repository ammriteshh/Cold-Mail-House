import { app } from "./app";
import { config } from "./config";
import { emailQueue } from "./queues/emailQueue";
import { emailWorker } from "./workers/emailWorker"; // starts worker

/* =====================
   START SERVER
   ===================== */
const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${config.env} mode`);
    console.log("📨 Email worker active");
});

const gracefulShutdown = async () => {
    console.log('🛑 Shutting down gracefully...');
    await emailQueue.close();
    await emailWorker.close();
    server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
