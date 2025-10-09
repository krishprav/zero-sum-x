import type { CookieOptions } from "express";
export declare const PRICE_SCALE = 10000;
export declare const USD_DECIMALS = 2;
export declare const USD_SCALE = 100;
export declare function toDisplayPrice(intPrice: number): number;
export declare function toInternalPrice(price: number): number;
export declare function toDisplayUSD(intUSD: number): number;
export declare function toInternalUSD(usd: number): number;
export declare function calculatePnlCents({ side, openPrice, closePrice, marginCents, leverage, }: {
    side: "buy" | "sell";
    openPrice: number;
    closePrice: number;
    marginCents: number;
    leverage: number;
}): number;
export declare function getCookieOptions(): CookieOptions;
//# sourceMappingURL=utils.d.ts.map