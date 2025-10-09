import express from "express";
import cors from "cors";
import { Client } from "pg";
import { userRouter } from "./router/user.js";
import { RedisManager } from "./utils/redisClient.js";
import { CLOSEDORDERS, ORDERS, PRICESTORE, USERS } from "./data/index.js";
import { calculatePnlCents } from "./utils/utils.js";
import { candelrouter } from "./router/candles.js";
import { tradesRouter } from "./router/trades.js";
import { assetrouter } from "./router/asset.js";
import { tradeRouter } from "./router/trade.js";
import { checkOpenPositions } from "./service/orderschecker.js";
import dotenv from "dotenv";
dotenv.config();
const port = Number(process.env.PORT) || 5000;
export const pgClient = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://user:XYZ@123@localhost:5433/trades_db",
});
// Connect to database
pgClient.connect().catch((error) => {
    console.warn("Database connection failed:", error);
    console.log("Server will continue without database connection");
});
export const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://exness.elevenai.xyz",
        "https://*.vercel.app",
        "https://zero-sum-x.vercel.app"
    ],
    credentials: true,
}));
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/trade", tradeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/candles", candelrouter);
app.use("/api/v1/asset", assetrouter);
async function startpriceuddate() {
    try {
        const redis = await RedisManager.getInstance();
        ["BTC", "ETH", "SOL"].forEach(async (asset) => {
            await redis.subscribe(asset, (msg) => {
                const data = JSON.parse(msg);
                PRICESTORE[asset] = { ask: data.askPrice, bid: data.bidPrice };
                checkOpenPositions(asset, { ask: data.askPrice, bid: data.bidPrice });
            });
        });
        setInterval(() => {
            console.log("PRICESTORE", PRICESTORE);
        }, 20000);
    }
    catch (error) {
        console.warn("Redis connection failed, using mock price data:", error);
        // Initialize with mock data if Redis is not available
        PRICESTORE["BTC"] = { ask: 45000, bid: 44950 };
        PRICESTORE["ETH"] = { ask: 3200, bid: 3195 };
        PRICESTORE["SOL"] = { ask: 180, bid: 179.5 };
        PRICESTORE["DOGE"] = { ask: 0.08, bid: 0.079 };
        PRICESTORE["USDC"] = { ask: 1.00, bid: 0.999 };
    }
}
startpriceuddate();
app.listen(port, () => {
    console.log(`App is listening on the port : ${port}`);
});
//# sourceMappingURL=index.js.map