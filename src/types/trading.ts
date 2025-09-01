export interface Asset {
  name: string;
  symbol: string;
  buyPrice: number; // Integer with 6 decimals
  sellPrice: number; // Integer with 6 decimals
  decimals: number;
  imageUrl: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export interface Candle {
  timestamp: number;
  open: number; // Integer with 6 decimals
  close: number;
  high: number;
  low: number;
  volume: number;
  decimal: number;
}

export interface Trade {
  orderId: string;
  type: 'buy' | 'sell';
  margin: number; // Integer with 2 decimals
  leverage: number;
  openPrice: number; // Integer with 6 decimals
  closePrice?: number;
  pnl?: number; // Integer with 2 decimals
  status: 'open' | 'closed';
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  usdBalance: number; // Integer with 2 decimals
}

export interface PriceUpdate {
  symbol: string;
  buyPrice: number; // Integer with 6 decimals
  sellPrice: number;
  decimals: number;
}

export type TimeFrame = '1m' | '5m' | '30m' | '1h' | '1d' | '3d' | '7d' | '30d' | '90d';

export interface TimeFrameOption {
  value: TimeFrame;
  label: string;
}
