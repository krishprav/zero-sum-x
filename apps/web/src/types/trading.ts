export type SYMBOL = "BTC" | "ETH" | "SOL" | "DOGE" | "USDC";

export enum Duration {
  candles_1m = "1m",
  candles_1d = "1d", 
  candles_1w = "1w"
}

export interface Trade {
  symbol: string;
  bidPrice: number;
  askPrice: number;
  time?: number;
}

export interface Order {
  id: string;
  symbol: SYMBOL;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  price: number;
  status: "open" | "filled" | "cancelled";
  createdAt: string;
  pnl?: number;
}

export interface UserBalance {
  usd_balance: number;
}

export interface Asset {
  symbol: string;
  name: string;
  imageUrl: string;
  price: number;
  change24h: number;
}
