import "dotenv/config";
import { WebSocket } from "ws";
import { createClient } from "redis";
import { publishQuote } from "./redisops.js";
import { toInternalPrice } from "./utils.js";
import { saveTradeBatch } from "./dbops.js";
import express from "express";

const BATCH_INTERVAL_MS = 10000;
const SYMBOLS: string[] = (process.env.SYMBOLS
  ? process.env.SYMBOLS.split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  : [
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
      "BNBUSDT",
      "XRPUSDT",
      "ADAUSDT",
      "DOGEUSDT",
      "AVAXUSDT",
      "LINKUSDT",
      "TONUSDT",
      "TRXUSDT",
      "MATICUSDT",
      "DOTUSDT",
      "LTCUSDT",
    ]) as string[];

type AggTrade = {
  e: string;
  E: number;
  s: string;
  a: number;
  p: string;
  q: string;
  T: number;
};

async function main() {
  // Start HTTP server for health checks
  const app = express();
  const port = process.env.PORT || 9090;
  
  app.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "price-poller",
      timestamp: new Date().toISOString(),
      symbols: SYMBOLS
    });
  });
  
  app.listen(port, () => {
    console.log(`Price poller health server running on port ${port}`);
  });

  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  const redisClient = createClient({ url: redisUrl });
  await redisClient.connect();
  console.log("Redis connected:", redisUrl);

  let tradeBatch: any[] = [];

  const flushBatch = async () => {
    const batch = tradeBatch;
    tradeBatch = [];
    await saveTradeBatch(batch);
  };

  const batchTimer = setInterval(() => {
    const batch = tradeBatch;
    tradeBatch = [];
    void saveTradeBatch(batch);
  }, BATCH_INTERVAL_MS);

  const ws = new WebSocket("wss://stream.binance.com:9443/ws");
  ws.on("open", () => {
    console.log("Connected to Binance stream");
    const params = SYMBOLS.map((s) => `${s.toLowerCase()}@aggTrade`);
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params,
        id: 1,
      }),
    );
  });

  ws.on("message", (raw: Buffer) => {
    const data = JSON.parse(raw.toString()) as Partial<AggTrade>;
    if (data.e !== "aggTrade") return;

    const priceInternal = toInternalPrice(data.p as string);
    const qtyInternal = toInternalPrice(data.q as string);
    const ts = new Date(data.T as number);

    publishQuote(redisClient, priceInternal, data.s as string, ts);

    tradeBatch.push({
      symbol: data.s,
      price: priceInternal,
      tradeId: BigInt(data.a as number),
      timestamp: ts,
      quantity: qtyInternal,
    });
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    console.log("Will retry connection in 30 seconds...");
    setTimeout(() => {
      console.log("Attempting to reconnect...");
      main().catch(console.error);
    }, 30000);
  });

  ws.on("close", () => {
    console.log("WebSocket closed; flushing remaining batch");
    clearInterval(batchTimer);
    void saveTradeBatch(tradeBatch);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}; shutting down...`);
    try {
      clearInterval(batchTimer);
      await flushBatch();
      try {
        ws.close();
      } catch {}
      await redisClient.quit();
    } catch (err) {
      console.error("Error during shutdown:", err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});