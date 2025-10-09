import { CacheManager } from '../utils/cacheManager.js';
class PerformanceMiddleware {
    metrics = {
        requestCount: 0,
        averageResponseTime: 0,
        errorCount: 0,
        cacheHitRate: 0,
    };
    cacheManager = null;
    async initialize() {
        this.cacheManager = await CacheManager.getInstance();
    }
    // Request timing and metrics
    requestTiming = (req, res, next) => {
        const startTime = Date.now();
        this.metrics.requestCount++;
        // Add performance headers
        res.setHeader('X-Response-Time', '0ms');
        res.setHeader('X-Request-ID', this.generateRequestId());
        // Override res.end to capture response time
        const originalEnd = res.end;
        res.end = function (chunk, encoding) {
            const responseTime = Date.now() - startTime;
            // Set response time header
            res.setHeader('X-Response-Time', `${responseTime}ms`);
            // Log slow requests
            if (responseTime > 1000) {
                console.warn(`Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
            }
            return originalEnd.call(res, chunk, encoding);
        };
        next();
    };
    // Rate limiting per IP
    rateLimiter = (() => {
        const requests = new Map();
        const WINDOW_MS = 60000; // 1 minute
        const MAX_REQUESTS = 100; // 100 requests per minute
        return (req, res, next) => {
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
    cache = (ttl = 300) => {
        return async (req, res, next) => {
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
            res.json = function (data) {
                res.setHeader('X-Cache', 'MISS');
                return originalJson.call(res, data);
            };
            next();
        };
    };
    // Compression middleware
    compression = (req, res, next) => {
        const acceptEncoding = req.headers['accept-encoding'] || '';
        if (acceptEncoding.includes('gzip')) {
            res.setHeader('Content-Encoding', 'gzip');
        }
        else if (acceptEncoding.includes('deflate')) {
            res.setHeader('Content-Encoding', 'deflate');
        }
        next();
    };
    // Request validation and sanitization
    validateRequest = (schema) => {
        return (req, res, next) => {
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
    errorHandler = (err, req, res, next) => {
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
    healthCheck = (req, res) => {
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
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCacheKey(req) {
        const { path, query } = req;
        const queryString = new URLSearchParams(query).toString();
        return `api:${path}:${queryString}`;
    }
    updateAverageResponseTime(responseTime) {
        const totalTime = this.metrics.averageResponseTime * (this.metrics.requestCount - 1);
        this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.requestCount;
    }
    sanitizeObject(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Basic XSS protection
                obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.sanitizeObject(obj[key]);
            }
        }
    }
    // Get current metrics
    getMetrics() {
        return { ...this.metrics };
    }
    // Reset metrics
    resetMetrics() {
        this.metrics = {
            requestCount: 0,
            averageResponseTime: 0,
            errorCount: 0,
            cacheHitRate: 0,
        };
    }
}
export const performanceMiddleware = new PerformanceMiddleware();
//# sourceMappingURL=performance.js.map