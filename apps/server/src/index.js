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
const port = 5000;
export const pgClient = new Client({
    host: "localhost",
    port: 5432,
    user: "user",
    password: "XYZ@123",
    database: "trades_db",
});
// Connect to database
pgClient.connect().catch(console.error);
export const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "https://exness.elevenai.xyz"],
    credentials: true,
}));
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/trade", tradeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/candles", candelrouter);
app.use("/api/v1/asset", assetrouter);
async function startpriceuddate() {
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
startpriceuddate();
app.listen(port, () => {
    console.log(`App is listening on the port : ${port}`);
});
//# sourceMappingURL=index.js.map