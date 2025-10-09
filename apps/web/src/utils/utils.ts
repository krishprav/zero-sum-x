const PRICE_SCALE = 10000;
const USD_SCALE = 100;

export function toDisplayPrice(intPrice: number): number {
  return intPrice / PRICE_SCALE;
}

export function toInternalPrice(price: number): number {
  return Math.round(price * PRICE_SCALE);
}

export function toDisplayUSD(intUSD: number): number {
  return intUSD / USD_SCALE;
}

export function toInternalUSD(usd: number): number {
  return Math.round(usd * USD_SCALE);
}

export function calculatePnlCents({
  side,
  openPrice,
  closePrice,
  marginCents,
  leverage,
}: {
  side: "buy" | "sell";
  openPrice: number;
  closePrice: number;
  marginCents: number;
  leverage: number;
}): number {
  const priceDiff = side === "buy" 
    ? closePrice - openPrice 
    : openPrice - closePrice;
  
  const pnlCents = (priceDiff * marginCents * leverage) / openPrice;
  return Math.round(pnlCents);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
