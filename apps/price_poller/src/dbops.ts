import prisma from "./dbconfig.js";

export type TradeRow = {
  symbol: string;
  price: number | bigint;
  tradeId: bigint;
  timestamp: Date;
  quantity: number | bigint;
};

export async function saveTradeBatch(tradeBatch: TradeRow[]) {
  if (tradeBatch.length === 0) return;

  const rows = tradeBatch.map((t) => ({
    symbol: t.symbol,
    price: BigInt(t.price),
    tradeId: t.tradeId,
    timestamp: t.timestamp,
    quantity: BigInt(t.quantity),
  }));

  const res = await prisma.trade.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log("batch inserted:", res.count);
}