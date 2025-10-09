import { Router, type Request, type Response } from "express";
import { executeQuery } from "../utils/dbPool.js";
import { CacheManager } from "../utils/cacheManager.js";
import { performanceMiddleware } from "../middleware/performance.js";

export const optimizedCandlesRouter: Router = Router();

// Input validation schema
const validateCandlesRequest = (req: Request, res: Response, next: any) => {
  const { ts, asset, startTime, endTime } = req.query;

  if (!ts || !asset || !startTime || !endTime) {
    return res.status(400).json({ 
      error: "Missing required parameters: ts, asset, startTime, endTime" 
    });
  }

  const validTimeframes = ['1m', '1h', '1d', '1w'];
  if (!validTimeframes.includes(ts as string)) {
    return res.status(400).json({ 
      error: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}` 
    });
  }

  const validAssets = ['BTC', 'ETH', 'SOL', 'DOGE', 'USDC'];
  if (!validAssets.includes(asset as string)) {
    return res.status(400).json({ 
      error: `Invalid asset. Must be one of: ${validAssets.join(', ')}` 
    });
  }

  // Validate timestamps
  const start = Number(startTime);
  const end = Number(endTime);
  if (isNaN(start) || isNaN(end) || start >= end) {
    return res.status(400).json({ 
      error: "Invalid timestamp range" 
    });
  }

  next();
};

optimizedCandlesRouter.get("/", 
  performanceMiddleware.cache(60), // Cache for 1 minute
  validateCandlesRequest,
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { ts, asset, startTime: start, endTime: end } = req.query;
      
      // Map timeframes to database tables
      const timeframeMap: { [key: string]: string } = {
        '1m': 'candles_1m',
        '1h': 'candles_1h', 
        '1d': 'candles_1d',
        '1w': 'candles_1w',
      };

      // Map assets to symbols
      const assetMap: { [key: string]: string } = {
        'BTC': 'BTCUSDT',
        'ETH': 'ETHUSDT',
        'SOL': 'SOLUSDT',
        'DOGE': 'DOGEUSDT',
        'USDC': 'USDCUSDT',
      };

      const dbtable = timeframeMap[ts as string];
      const symbol = assetMap[asset as string];

      // Check cache first
      const cacheManager = await CacheManager.getInstance();
      const cacheKey = `candles:${symbol}:${ts}:${start}:${end}`;
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json({ candles: cachedData });
      }

      // Optimized query with proper indexing
      const query = `
        SELECT 
          bucket,
          open,
          high,
          low,
          close,
          volume
        FROM ${dbtable} 
        WHERE symbol = $1 
          AND bucket >= $2 
          AND bucket <= $3 
        ORDER BY bucket ASC
        LIMIT 1000
      `;

      const startDate = new Date(Number(start) * 1000);
      const endDate = new Date(Number(end) * 1000);

      const data = await executeQuery(query, [symbol, startDate, endDate]);

      // Transform data for frontend
      const candles = data.map((row: any) => ({
        time: Math.floor(new Date(row.bucket).getTime() / 1000),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        volume: Number(row.volume || 0),
      }));

      // Cache the result
      await cacheManager.set(cacheKey, candles, 60);

      const responseTime = Date.now() - startTime;
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Data-Count', candles.length.toString());

      res.status(200).json({ candles });

    } catch (err) {
      console.error("Candles endpoint error:", err);
      res.status(500).json({
        error: "Failed to fetch candle data",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Bulk candles endpoint for multiple symbols
optimizedCandlesRouter.get("/bulk",
  performanceMiddleware.cache(120), // Cache for 2 minutes
  async (req: Request, res: Response) => {
    try {
      const { symbols, timeframe, limit = 100 } = req.query;
      
      if (!symbols || !timeframe) {
        return res.status(400).json({ 
          error: "Missing required parameters: symbols, timeframe" 
        });
      }

      const symbolList = (symbols as string).split(',');
      const cacheManager = await CacheManager.getInstance();
      const results: { [key: string]: any[] } = {};

      // Fetch data for each symbol in parallel
      const promises = symbolList.map(async (symbol: string) => {
        const cacheKey = `candles:${symbol}:${timeframe}:bulk`;
        let data = await cacheManager.get(cacheKey);
        
        if (!data) {
          const query = `
            SELECT bucket, open, high, low, close, volume
            FROM candles_${timeframe}
            WHERE symbol = $1
            ORDER BY bucket DESC
            LIMIT $2
          `;
          
          const rows = await executeQuery(query, [symbol, limit]);
          data = rows.map((row: any) => ({
            time: Math.floor(new Date(row.bucket).getTime() / 1000),
            open: Number(row.open),
            high: Number(row.high),
            low: Number(row.low),
            close: Number(row.close),
            volume: Number(row.volume || 0),
          }));

          await cacheManager.set(cacheKey, data, 120);
        }

        results[symbol] = data as any[];
      });

      await Promise.all(promises);

      res.status(200).json({ data: results });

    } catch (err) {
      console.error("Bulk candles endpoint error:", err);
      res.status(500).json({
        error: "Failed to fetch bulk candle data",
        timestamp: new Date().toISOString(),
      });
    }
  }
);
