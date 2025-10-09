import { Router, type Request, type Response } from "express";
import { usermiddleware } from "../middleware/index.js";
import { CLOSEDORDERS, ORDERS, PRICESTORE, USERS } from "../data/index.js";
import { tradeSchema } from "../types/userschema.js";
import { v4 } from "uuid";
import { USD_SCALE, calculatePnlCents } from "../utils/utils.js";
import { closeOrder } from "../utils/tradeUtils.js";

export const tradeRouter: Router = Router();

tradeRouter.post("/", usermiddleware, async (req: Request, res: Response) => {
  try {
    const tradeschema = tradeSchema.safeParse(req.body);
    if (!tradeschema.success) {
      return res.status(411).json({ message: "Incorrect inputs" });
    }
    let { asset, type, margin, leverage, takeProfit, stopLoss } =
      tradeschema.data;

    //@ts-ignore
    const userid = req.userId;
    const user = USERS[userid];

    if (!user) {
      return res.status(411).json({ message: "User not found" });
    }

    if (asset && asset.endsWith("USDT")) {
      asset = asset.replace("USDT", "") as any;
    }

    const basePriceData = PRICESTORE[asset];
    const openPrice = type === "buy" ? basePriceData?.ask : basePriceData?.bid;

    if (!openPrice || user.balance.usd_balance < margin) {
      return res
        .status(411)
        .json({ message: "Invalid asset or insufficient funds" });
    }

    user.balance.usd_balance -= margin;

    const orderid = v4();

    // Compute liquidation price: when unrealized PnL <= -margin
    // PnL = ((close - open) / open) * (margin * leverage)
    // Set liquidation where PnL = -margin -> ((close - open)/open) * leverage = -1
    // => close = open * (1 - 1/leverage) for long; for short, close = open * (1 + 1/leverage)
    // Formula for long: close = open * (1 - 1 / leverage)
    // This calculates the price at which the loss equals 100% of the margin.
    const liquidationPrice =
      type === "buy"
        ? Math.floor((openPrice as number) * (1 - 1 / leverage))
        : // Formula for short: close = open * (1 + 1 / leverage)
          Math.floor((openPrice as number) * (1 + 1 / leverage));

    const order: {
      type: "buy" | "sell";
      margin: number;
      leverage: number;
      asset: string;
      openPrice: number;
      timestamp: number;
      takeProfit?: number;
      stopLoss?: number;
      liquidationPrice?: number;
    } = {
      type,
      margin,
      leverage,
      asset,
      openPrice: openPrice as number,
      timestamp: Date.now(),
      liquidationPrice,
    };

    if (takeProfit) {
      order.takeProfit = Math.round(takeProfit * 10000);
    }
    if (stopLoss) {
      order.stopLoss = Math.round(stopLoss * 10000);
    }

    if (!ORDERS[userid]) {
      ORDERS[userid] = {};
    }
    ORDERS[userid][orderid] = order;

    return res.status(200).json({ orderId: orderid });
  } catch (e) {
    console.log("error while trade", e);
    return res
      .status(500)
      .json({ message: "Server error during trade creation" });
  }
});

tradeRouter.post("/close", usermiddleware, (req: Request, res: Response) => {
  try {
    const { orderid } = req.body;
    //@ts-ignore
    const userid = req.userId;
    if (!ORDERS[userid] || !ORDERS[userid][orderid]) {
      return res.status(404).json({ message: "Order not found" });
    }

    const pnl = closeOrder(userid, orderid, "manual");

    return res.status(200).json({
      message: "Position closed successfully",
      pnl: pnl,
    });
  } catch (e) {
    console.log("Err", e);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
