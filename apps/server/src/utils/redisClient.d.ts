export declare class RedisManager {
    private static instance;
    private pubclient;
    private subclient;
    private constructor();
    static getInstance(): Promise<RedisManager>;
    private connect;
    publish(channel: string, message: any): Promise<void>;
    getlatestprice(asset: string): Promise<void>;
    subscribe(channel: string, callback: any): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=redisClient.d.ts.map