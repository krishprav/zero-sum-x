import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";

export class RedisManager {
  private static instance: RedisManager;
  private pubclient: RedisClientType;
  private subclient: RedisClientType;

  private constructor() {
    this.pubclient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    this.subclient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
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

  private async connect() {
    try {
      await this.pubclient.connect();
      await this.subclient.connect();
      console.log("Redis connected successfully");
    } catch (error) {
      console.error("Redis connection failed:", error);
      console.log("Redis operations will be disabled");
    }
  }

  async publish(channel: string, message: any) {
    const msg = JSON.stringify(message);
    await this.pubclient.publish(channel, msg);
  }

  async getlatestprice(asset: string) {
    this.subclient.subscribe(asset, (msg) => {
      if (msg) {
      }
    });
  }

  async subscribe(channel: string, callback: any) {
    await this.subclient.subscribe(channel, (msg) => {
      callback(msg);
    });
  }
  
  async disconnect() {
    await this.pubclient.destroy();
    await this.subclient.destroy();
  }
}
