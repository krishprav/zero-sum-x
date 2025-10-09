import { Pool, type PoolClient } from 'pg';
export declare const dbPool: Pool;
export declare function executeQuery<T = any>(query: string, params?: any[], client?: PoolClient): Promise<T[]>;
export declare function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
export declare function checkDbHealth(): Promise<boolean>;
export declare function closeDbPool(): Promise<void>;
//# sourceMappingURL=dbPool.d.ts.map