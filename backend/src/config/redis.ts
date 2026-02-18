import IORedis from 'ioredis';
import { config } from './index';

// Create a Redis client instance
// Create a Redis client instance
const connection = config.redis.url
    ? new IORedis(config.redis.url, {
        maxRetriesPerRequest: null, // Required for BullMQ
    })
    : new IORedis({
        host: config.redis.host,
        port: config.redis.port,
        maxRetriesPerRequest: null, // Required for BullMQ
    });

connection.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

connection.on('connect', () => {
    console.log('✅ Connected to Redis');
});

export default connection;
