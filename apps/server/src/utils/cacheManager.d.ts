export declare class CacheManager {
    private static instance;
    private redis;
    private memoryCache;
    private config;
    private constructor();
    static getInstance(): Promise<CacheManager>;
    private initialize;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, data: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    private isExpired;
    cachePriceData(symbol: string, priceData: any): Promise<void>;
    getPriceData(symbol: string): Promise<any | null>;
    cacheCandles(symbol: string, timeframe: string, candles: any[]): Promise<void>;
    getCandles(symbol: string, timeframe: string): Promise<any[] | null>;
    cacheUserData(userId: string, userData: any): Promise<void>;
    getUserData(userId: string): Promise<any | null>;
    warmupCache(): Promise<void>;
    private cleanupMemoryCache;
    startCleanup(): void;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=cacheManager.d.ts.map