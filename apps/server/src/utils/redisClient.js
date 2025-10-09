import { createClient } from "@redis/client";
export class RedisManager {
    static instance;
    pubclient;
    subclient;
    constructor() {
        this.pubclient = createClient({
            url: "redis://localhost:6379",
        });
        this.subclient = createClient({
            url: "redis://localhost:6379",
        });
    }
    static async getInstance() {
        if (!RedisManager.instance) {
            const manager = new RedisManager();
            await manager.connect();
            RedisManager.instance = manager;
        }
        return this.instance;
    }
    async connect() {
        await this.pubclient.connect(), await this.subclient.connect();
    }
    async publish(channel, message) {
        const msg = JSON.stringify(message);
        await this.pubclient.publish(channel, msg);
    }
    async getlatestprice(asset) {
        this.subclient.subscribe(asset, (msg) => {
            if (msg) {
            }
        });
    }
    async subscribe(channel, callback) {
        await this.subclient.subscribe(channel, (msg) => {
            callback(msg);
        });
    }
    async disconnect() {
        await this.pubclient.destroy();
        await this.subclient.destroy();
    }
}
//# sourceMappingURL=redisClient.js.map