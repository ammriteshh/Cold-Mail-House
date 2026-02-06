
import connection from './config/redis';

async function testConnection() {
    try {
        console.log("Connecting to Redis...");
        if (connection.status === 'ready') {
            console.log("Already connected!");
        } else {
            await connection.connect(); // This might not be needed if lazyConnect is false, but safe to try or just wait for event
            console.log("Connected status:", connection.status);
        }

        console.log("Ping:", await connection.ping());
        process.exit(0);
    } catch (error) {
        console.error("Redis Error:", error);
        process.exit(1);
    }
}

testConnection();
