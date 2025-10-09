-- CreateTable
CREATE TABLE "public"."Trade" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "tradeId" BIGINT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,
    "quantity" BIGINT NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeId_timestamp_key" ON "public"."Trade"("tradeId", "timestamp");
