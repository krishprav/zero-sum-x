import { fromInternalPrice, toInternalPrice } from "./utils.js";

const KNOWN_QUOTES = [
  "USDT",
  "USD",
  "FDUSD",
  "USDC",
  "BUSD",
  "TUSD",
  "EUR",
  "TRY",
  "BRL",
  "BTC",
  "ETH",
  "BNB",
];

function toChannel(symbol: string): string {
  const upper = symbol.toUpperCase();
  for (const quote of KNOWN_QUOTES) {
    if (upper.endsWith(quote)) return upper.slice(0, upper.length - quote.length);
  }
  return upper;
}

export function publishQuote(
  redis: any,
  priceInternal: number,
  symbol: string,
  time: Date,
) {
  const channel = toChannel(symbol);

  const realVal = fromInternalPrice(BigInt(priceInternal));
  // Realistic spread: 0.02% (20 basis points) instead of 1%
  // This creates much more realistic candlestick patterns
  const spreadFactor = 0.0002; // 0.02% spread
  const ask = toInternalPrice(Number((realVal * (1 + spreadFactor / 2)).toFixed(2)));
  const bid = toInternalPrice(Number((realVal * (1 - spreadFactor / 2)).toFixed(2)));

  redis.publish(
    channel,
    JSON.stringify({
      symbol: channel,
      askPrice: ask,
      bidPrice: bid,
      decimals: 4,
      time: Math.floor(time.getTime() / 1000),
    }),
  );
}