import IORedis from 'ioredis';
import { config } from './index';

// Create a Redis client instance
const connection = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null, // Required for BullMQ
});

export default connection;
