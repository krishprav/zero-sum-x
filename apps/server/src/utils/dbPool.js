import { Pool } from 'pg';
// Connection pool configuration for high-performance trading
export const dbPool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://user:XYZ@123@localhost:5433/trades_db",
    // Performance optimizations
    max: 20, // Maximum connections
    min: 5, // Minimum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Timeout after 2s
    // TimescaleDB optimizations
    statement_timeout: 30000, // 30s statement timeout
    query_timeout: 30000, // 30s query timeout
    // Connection health checks
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
});
// Optimized query executor with connection management
export async function executeQuery(query, params = [], client) {
    const startTime = Date.now();
    try {
        if (client) {
            const result = await client.query(query, params);
            return result.rows;
        }
        else {
            const result = await dbPool.query(query, params);
            return result.rows;
        }
    }
    catch (error) {
        console.error(`Query failed after ${Date.now() - startTime}ms:`, error);
        throw error;
    }
    finally {
        const duration = Date.now() - startTime;
        if (duration > 1000) {
            console.warn(`Slow query detected: ${duration}ms - ${query.substring(0, 100)}...`);
        }
    }
}
// Transaction helper for atomic operations
export async function withTransaction(callback) {
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
// Health check for database connections
export async function checkDbHealth() {
    try {
        const result = await dbPool.query('SELECT 1');
        return result.rows.length > 0;
    }
    catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}
// Graceful shutdown
export async function closeDbPool() {
    await dbPool.end();
}
//# sourceMappingURL=dbPool.js.map