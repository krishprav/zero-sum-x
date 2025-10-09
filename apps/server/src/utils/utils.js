export const PRICE_SCALE = 10000;
export const USD_DECIMALS = 2;
export const USD_SCALE = 100;
export function toDisplayPrice(intPrice) {
    return intPrice / PRICE_SCALE;
}
export function toInternalPrice(price) {
    return Math.round(price * PRICE_SCALE);
}
export function toDisplayUSD(intUSD) {
    return intUSD / USD_SCALE;
}
export function toInternalUSD(usd) {
    return Math.round(usd * USD_SCALE);
}
// Calculate PnL using integer math to avoid precision loss
export function calculatePnlCents({ side, openPrice, closePrice, marginCents, leverage, }) {
    const MONEY_SCALE = 100n;
    const PRICE_SCALE = 10000n;
    const CONVERSION_FACTOR = PRICE_SCALE / MONEY_SCALE; // 100n
    const openP = BigInt(openPrice);
    const closeP = BigInt(closePrice);
    const margin = BigInt(marginCents);
    const lev = BigInt(leverage);
    const marginOnPriceScale = margin * CONVERSION_FACTOR;
    const totalPositionValue = marginOnPriceScale * lev;
    let pnlOnPriceScale = ((closeP - openP) * totalPositionValue) / openP;
    if (side === "sell") {
        pnlOnPriceScale = -pnlOnPriceScale;
    }
    const finalPnl = pnlOnPriceScale / CONVERSION_FACTOR;
    return Number(finalPnl);
}
export function getCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    return {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        domain: isProd ? ".exness.elevenai.xyz" : undefined,
    };
}
//# sourceMappingURL=utils.js.map