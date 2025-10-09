import { createClient } from 'redis';
export class CacheManager {
    static instance;
    redis;
    memoryCache = new Map();
    config;
    constructor() {
        this.config = {
            defaultTTL: 300, // 5 minutes
            maxRetries: 3,
            retryDelay: 100,
        };
    }
    static async getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
            await CacheManager.instance.initialize();
        }
        return CacheManager.instance;
    }
    async initialize() {
        try {
            this.redis = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > this.config.maxRetries) {
                            console.warn('Redis connection failed, using memory cache only');
                            return false;
                        }
                        return this.config.retryDelay * retries;
                    },
                },
            });
            await this.redis.connect();
            console.log('Cache manager initialized with Redis');
        }
        catch (error) {
            console.warn('Redis connection failed, using memory cache only:', error);
        }
    }
    // Multi-level caching: Memory -> Redis -> Database
    async get(key) {
        // 1. Check memory cache first
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && !this.isExpired(memoryEntry)) {
            return memoryEntry.data;
        }
        // 2. Check Redis cache
        if (this.redis?.isReady) {
            try {
                const redisData = await this.redis.get(key);
                if (redisData) {
                    const parsed = JSON.parse(redisData);
                    // Store in memory cache for faster access
                    this.memoryCache.set(key, parsed);
                    return parsed.data;
                }
            }
            catch (error) {
                console.warn('Redis get error:', error);
            }
        }
        return null;
    }
    async set(key, data, ttl = this.config.defaultTTL) {
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: ttl * 1000,
        };
        // Store in memory cache
        this.memoryCache.set(key, entry);
        // Store in Redis cache
        if (this.redis?.isReady) {
            try {
                await this.redis.setEx(key, ttl, JSON.stringify(entry));
            }
            catch (error) {
                console.warn('Redis set error:', error);
            }
        }
    }
    async del(key) {
        this.memoryCache.delete(key);
        if (this.redis?.isReady) {
            try {
                await this.redis.del(key);
            }
            catch (error) {
                console.warn('Redis delete error:', error);
            }
        }
    }
    async invalidatePattern(pattern) {
        // Clear memory cache entries matching pattern
        for (const key of this.memoryCache.keys()) {
            if (key.includes(pattern)) {
                this.memoryCache.delete(key);
            }
        }
        // Clear Redis cache entries matching pattern
        if (this.redis?.isReady) {
            try {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(keys);
                }
            }
            catch (error) {
                console.warn('Redis pattern invalidation error:', error);
            }
        }
    }
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }
    // Trading-specific cache methods
    async cachePriceData(symbol, priceData) {
        await this.set(`price:${symbol}`, priceData, 30); // 30 seconds TTL
    }
    async getPriceData(symbol) {
        return await this.get(`price:${symbol}`);
    }
    async cacheCandles(symbol, timeframe, candles) {
        const key = `candles:${symbol}:${timeframe}`;
        await this.set(key, candles, 60); // 1 minute TTL
    }
    async getCandles(symbol, timeframe) {
        return await this.get(`candles:${symbol}:${timeframe}`);
    }
    async cacheUserData(userId, userData) {
        await this.set(`user:${userId}`, userData, 300); // 5 minutes TTL
    }
    async getUserData(userId) {
        return await this.get(`user:${userId}`);
    }
    // Cache warming for critical data
    async warmupCache() {
        const symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'USDC'];
        for (const symbol of symbols) {
            // Warm up price data
            try {
                // This would fetch from database and cache
                console.log(`Warming up cache for ${symbol}`);
            }
            catch (error) {
                console.warn(`Failed to warm up cache for ${symbol}:`, error);
            }
        }
    }
    // Memory management
    cleanupMemoryCache() {
        const now = Date.now();
        for (const [key, entry] of this.memoryCache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.memoryCache.delete(key);
            }
        }
    }
    // Start periodic cleanup
    startCleanup() {
        setInterval(() => {
            this.cleanupMemoryCache();
        }, 60000); // Clean every minute
    }
    async disconnect() {
        if (this.redis?.isReady) {
            await this.redis.disconnect();
        }
    }
}
//# sourceMappingURL=cacheManager.js.map