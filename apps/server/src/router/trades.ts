import { Router, type Request, type Response } from "express";
import { usermiddleware } from "../middleware/index.js";
import { CLOSEDORDERS, ORDERS } from "../data/index.js";

export const tradesRouter: Router = Router();

tradesRouter.get("/open", usermiddleware, (req: Request, res: Response) => {
  //@ts-ignore
  const userid = req.userId;
  if (!ORDERS[userid]) {
    return res.status(200).json({
      trades: [],
    });
  }

  const formattedTrades = Object.entries(ORDERS[userid]).map(
    ([orderId, order]) => ({
      orderId,
      type: order.type,
      margin: order.margin,
      leverage: order.leverage,
      asset: order.asset,
      openPrice: order.openPrice,
      takeProfit: order.takeProfit,
      stopLoss: order.stopLoss,
      liquidationPrice: order.liquidationPrice,
    }),
  );

  return res.status(200).json({
    trades: formattedTrades,
  });
});

tradesRouter.get("/", usermiddleware, (req: Request, res: Response) => {
  //@ts-ignore
  const userid = req.userId!;

  if (!CLOSEDORDERS[userid]) {
    return res.status(200).json({
      trades: [],
    });
  }

  const formattedtrades = Object.entries(CLOSEDORDERS[userid] ?? {}).map(
    ([orderId, order]) => ({
      orderId,
      type: order.type,
      margin: order.margin,
      leverage: order.leverage,
      openPrice: order.openPrice,
      closePrice: order.closePrice,
      pnl: order.pnl,
    }),
  );

  return res.status(200).json({
    trades: formattedtrades,
  });
});

tradesRouter.post("/orders", (req: Request, res: Response) => {
  const query = req.query;
});
