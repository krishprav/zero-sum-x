import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";
import { WebSocketServer, WebSocket } from "ws";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const port = Number(process.env.WS_PORT ?? 8080);

const redis = createClient({ url: redisUrl });
const wss = new WebSocketServer({ port });
const clientSubscriptions = new Map<WebSocket, Set<string>>();

export const Channels = ["SOL", "ETH", "BTC"] as const;
type Channel = (typeof Channels)[number];

async function start() {
  await redis.connect();
  console.log("Redis connected:", redisUrl);
  console.log("WebSocket server listening on", port);

  // Subscribe to all channels and fan out to subscribed clients
  Channels.forEach((ch: Channel) => {
    redis.subscribe(ch, (payload: string) => {
      clientSubscriptions.forEach((symbols, ws) => {
        if (ws.readyState === ws.OPEN && symbols.has(ch)) {
          ws.send(payload);
        }
      });
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    clientSubscriptions.set(ws, new Set());

    ws.on("message", (msg: Buffer) => {
      const message = JSON.parse(msg.toString());

      if (message.type === "SUBSCRIBE" && typeof message.symbol === "string") {
        const set = clientSubscriptions.get(ws) ?? new Set<string>();
        set.add(message.symbol.toUpperCase());
        clientSubscriptions.set(ws, set);
      }

      if (message.type === "UNSUBSCRIBE" && typeof message.symbol === "string") {
        const set = clientSubscriptions.get(ws);
        set?.delete(message.symbol.toUpperCase());
        if (set && set.size === 0) {
          clientSubscriptions.delete(ws);
        }
      }
    });

    ws.on("close", () => {
      clientSubscriptions.delete(ws);
    });
    ws.on("error", () => {
      clientSubscriptions.delete(ws);
      ws.close();
    });
  });
}

start().catch((err) => {
  console.error("WS service error:", err);
  process.exit(1);
});