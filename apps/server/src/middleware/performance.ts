import { Request, Response, NextFunction } from 'express';
import { CacheManager } from '../utils/cacheManager.js';

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorCount: number;
  cacheHitRate: number;
}

class PerformanceMiddleware {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorCount: 0,
    cacheHitRate: 0,
  };

  private cacheManager: CacheManager | null = null;

  async initialize(): Promise<void> {
    this.cacheManager = await CacheManager.getInstance();
  }

  // Request timing and metrics
  requestTiming = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    this.metrics.requestCount++;

    // Add performance headers
    res.setHeader('X-Response-Time', '0ms');
    res.setHeader('X-Request-ID', this.generateRequestId());

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      
      // Update average response time
      this.updateAverageResponseTime(responseTime);
      
      // Set response time header
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      
      // Log slow requests
      if (responseTime > 1000) {
        console.warn(`Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
      }

      originalEnd.call(res, chunk, encoding);
    }.bind(this);

    next();
  };

  // Rate limiting per IP
  rateLimiter = (() => {
    const requests = new Map<string, { count: number; resetTime: number }>();
    const WINDOW_MS = 60000; // 1 minute
    const MAX_REQUESTS = 100; // 100 requests per minute

    return (req: Request, res: Response, next: NextFunction): void => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      
      const requestData = requests.get(ip);
      
      if (!requestData || now > requestData.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        next();
        return;
      }

      if (requestData.count >= MAX_REQUESTS) {
        res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
        return;
      }

      requestData.count++;
      next();
    };
  })();

  // Caching middleware for GET requests
  cache = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (req.method !== 'GET' || !this.cacheManager) {
        next();
        return;
      }

      const cacheKey = this.generateCacheKey(req);
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', ttl.toString());
        res.json(cachedData);
        return;
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        this.cacheManager?.set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
        originalJson.call(res, data);
      }.bind(this);

      next();
    };
  };

  // Compression middleware
  compression = (req: Request, res: Response, next: NextFunction): void => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
    } else if (acceptEncoding.includes('deflate')) {
      res.setHeader('Content-Encoding', 'deflate');
    }

    next();
  };

  // Request validation and sanitization
  validateRequest = (schema?: any) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Basic input validation
      if (req.body && typeof req.body === 'object') {
        // Sanitize string inputs
        this.sanitizeObject(req.body);
      }

      // Validate query parameters
      if (req.query && typeof req.query === 'object') {
        this.sanitizeObject(req.query);
      }

      next();
    };
  };

  // Error handling with metrics
  errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    this.metrics.errorCount++;

    console.error(`Error in ${req.method} ${req.path}:`, err);

    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'Internal server error' : err.message;

    res.status(500).json({
      error: message,
      requestId: res.getHeader('X-Request-ID'),
      timestamp: new Date().toISOString(),
    });
  };

  // Health check endpoint
  healthCheck = (req: Request, res: Response): void => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    };

    res.json(health);
  };

  // Private helper methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(req: Request): string {
    const { path, query } = req;
    const queryString = new URLSearchParams(query as any).toString();
    return `api:${path}:${queryString}`;
  }

  private updateAverageResponseTime(responseTime: number): void {
    const totalTime = this.metrics.averageResponseTime * (this.metrics.requestCount - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.requestCount;
  }

  private sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Basic XSS protection
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorCount: 0,
      cacheHitRate: 0,
    };
  }
}

export const performanceMiddleware = new PerformanceMiddleware();
