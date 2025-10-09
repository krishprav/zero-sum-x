export declare const USERS: Record<string, {
    email: string;
    password: string;
    balance: {
        usd_balance: number;
    };
    assets: Record<string, number>;
}>;
export declare const SECRET = "mysupersectret";
export declare const ORDERS: Record<string, Record<string, {
    type: "buy" | "sell";
    margin: number;
    leverage: number;
    asset: string;
    openPrice: number;
    timestamp: number;
    takeProfit?: number;
    stopLoss?: number;
    liquidationPrice?: number;
}>>;
export declare const PRICESTORE: Record<string, {
    bid: number;
    ask: number;
}>;
export declare const CLOSEDORDERS: Record<string, Record<string, {
    type: "buy" | "sell";
    margin: number;
    leverage: number;
    asset: string;
    openPrice: number;
    closePrice: number;
    pnl: number;
    timestamp: number;
    closeTimestamp: number;
    closeReason: "manual" | "take_profit" | "stop_loss" | "liquidation";
}>>;
//# sourceMappingURL=index.d.ts.map