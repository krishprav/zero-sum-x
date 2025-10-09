import { createClient, type RedisClientType } from 'redis';

interface CacheConfig {
  defaultTTL: number;
  maxRetries: number;
  retryDelay: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private redis!: RedisClientType;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;

  private constructor() {
    this.config = {
      defaultTTL: 300, // 5 minutes
      maxRetries: 3,
      retryDelay: 100,
    };
  }

  static async getInstance(): Promise<CacheManager> {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
      await CacheManager.instance.initialize();
    }
    return CacheManager.instance;
  }

  private async initialize(): Promise<void> {
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
    } catch (error) {
      console.warn('Redis connection failed, using memory cache only:', error);
    }
  }

  // Multi-level caching: Memory -> Redis -> Database
  async get<T>(key: string): Promise<T | null> {
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
          const parsed: CacheEntry<T> = JSON.parse(redisData);
          // Store in memory cache for faster access
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
      } catch (error) {
        console.warn('Redis get error:', error);
      }
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): Promise<void> {
    const entry: CacheEntry<T> = {
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
      } catch (error) {
        console.warn('Redis set error:', error);
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.redis?.isReady) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.warn('Redis delete error:', error);
      }
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
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
      } catch (error) {
        console.warn('Redis pattern invalidation error:', error);
      }
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Trading-specific cache methods
  async cachePriceData(symbol: string, priceData: any): Promise<void> {
    await this.set(`price:${symbol}`, priceData, 30); // 30 seconds TTL
  }

  async getPriceData(symbol: string): Promise<any | null> {
    return await this.get(`price:${symbol}`);
  }

  async cacheCandles(symbol: string, timeframe: string, candles: any[]): Promise<void> {
    const key = `candles:${symbol}:${timeframe}`;
    await this.set(key, candles, 60); // 1 minute TTL
  }

  async getCandles(symbol: string, timeframe: string): Promise<any[] | null> {
    return await this.get(`candles:${symbol}:${timeframe}`);
  }

  async cacheUserData(userId: string, userData: any): Promise<void> {
    await this.set(`user:${userId}`, userData, 300); // 5 minutes TTL
  }

  async getUserData(userId: string): Promise<any | null> {
    return await this.get(`user:${userId}`);
  }

  // Cache warming for critical data
  async warmupCache(): Promise<void> {
    const symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'USDC'];
    
    for (const symbol of symbols) {
      // Warm up price data
      try {
        // This would fetch from database and cache
        console.log(`Warming up cache for ${symbol}`);
      } catch (error) {
        console.warn(`Failed to warm up cache for ${symbol}:`, error);
      }
    }
  }

  // Memory management
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Start periodic cleanup
  startCleanup(): void {
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60000); // Clean every minute
  }

  async disconnect(): Promise<void> {
    if (this.redis?.isReady) {
      await this.redis.disconnect();
    }
  }
}
