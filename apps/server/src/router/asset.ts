import { Router, type Request, type Response } from "express";
import { PRICESTORE } from "../data/index.js";

export const assetrouter: Router = Router();

assetrouter.get("/", async (req: Request, res: Response) => {
  const assetDetails = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 4,
      imageUrl: "/assets/btc.svg",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 4,
      imageUrl: "/assets/eth.svg",
    },
    {
      name: "Solana",
      symbol: "SOL",
      decimals: 4,
      imageUrl: "/assets/solana.svg",
    },
    {
      name: "Dogecoin",
      symbol: "DOGE",
      decimals: 4,
      imageUrl: "/assets/doge.svg",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 4,
      imageUrl: "/assets/usdc.svg",
    },
  ];

  const responseAssets = assetDetails.map((asset) => {
    const priceData = PRICESTORE[asset.symbol];

    if (!priceData) {
      return {
        name: asset.name,
        symbol: asset.symbol,
        buyPrice: 0,
        sellPrice: 0,
        decimals: asset.decimals,
        imageUrl: asset.imageUrl,
      };
    }

    return {
      name: asset.name,
      symbol: asset.symbol,
      buyPrice: priceData?.ask, //buy price is(more one)
      sellPrice: priceData?.bid, // seel price
      decimals: asset.decimals,
      imageUrl: asset.imageUrl,
    };
  });

  res.status(200).json({ assets: responseAssets });
});
