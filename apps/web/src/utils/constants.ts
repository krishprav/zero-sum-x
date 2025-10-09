export const Channels = {
  BTC: "BTC",
  ETH: "ETH", 
  SOL: "SOL",
  DOGE: "DOGE",
  USDC: "USDC"
} as const;

export type SYMBOL = keyof typeof Channels;

export enum Duration {
  candles_1m = "1m",
  candles_1d = "1d",
  candles_1w = "1w"
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Design System - Consistent Padding
export const PADDING = {
  // Container padding
  container: {
    xs: 'p-0.5',    // 2px
    sm: 'p-1',      // 4px  
    md: 'p-2',      // 8px
    lg: 'p-3',      // 12px
    xl: 'p-4',      // 16px
  },
  // Component padding
  component: {
    xs: 'p-1',      // 4px
    sm: 'p-2',      // 8px
    md: 'p-3',      // 12px
    lg: 'p-4',      // 16px
    xl: 'p-5',      // 20px
  },
  // Section padding
  section: {
    xs: 'py-0.5 px-1',  // 2px vertical, 4px horizontal
    sm: 'py-1 px-2',    // 4px vertical, 8px horizontal
    md: 'py-2 px-3',    // 8px vertical, 12px horizontal
    lg: 'py-3 px-4',    // 12px vertical, 16px horizontal
    xl: 'py-4 px-6',    // 16px vertical, 24px horizontal
  },
  // Gap spacing
  gap: {
    xs: 'gap-0.5',  // 2px
    sm: 'gap-1',    // 4px
    md: 'gap-2',    // 8px
    lg: 'gap-3',    // 12px
    xl: 'gap-4',    // 16px
  }
} as const;
