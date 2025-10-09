import type { Request, Response, NextFunction } from 'express';
interface PerformanceMetrics {
    requestCount: number;
    averageResponseTime: number;
    errorCount: number;
    cacheHitRate: number;
}
declare class PerformanceMiddleware {
    private metrics;
    private cacheManager;
    initialize(): Promise<void>;
    requestTiming: (req: Request, res: Response, next: NextFunction) => void;
    rateLimiter: (req: Request, res: Response, next: NextFunction) => void;
    cache: (ttl?: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    compression: (req: Request, res: Response, next: NextFunction) => void;
    validateRequest: (schema?: any) => (req: Request, res: Response, next: NextFunction) => void;
    errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
    healthCheck: (req: Request, res: Response) => void;
    private generateRequestId;
    private generateCacheKey;
    private updateAverageResponseTime;
    private sanitizeObject;
    getMetrics(): PerformanceMetrics;
    resetMetrics(): void;
}
export declare const performanceMiddleware: PerformanceMiddleware;
export {};
//# sourceMappingURL=performance.d.ts.map