"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const index_1 = require("./index");
// Create a Redis client instance
// Create a Redis client instance
const connection = index_1.config.redis.url
    ? new ioredis_1.default(index_1.config.redis.url, {
        maxRetriesPerRequest: null, // Required for BullMQ
    })
    : new ioredis_1.default({
        host: index_1.config.redis.host,
        port: index_1.config.redis.port,
        maxRetriesPerRequest: null, // Required for BullMQ
    });
exports.default = connection;
