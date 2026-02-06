"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("./config/redis"));
async function testConnection() {
    try {
        console.log("Connecting to Redis...");
        if (redis_1.default.status === 'ready') {
            console.log("Already connected!");
        }
        else {
            await redis_1.default.connect(); // This might not be needed if lazyConnect is false, but safe to try or just wait for event
            console.log("Connected status:", redis_1.default.status);
        }
        console.log("Ping:", await redis_1.default.ping());
        process.exit(0);
    }
    catch (error) {
        console.error("Redis Error:", error);
        process.exit(1);
    }
}
testConnection();
