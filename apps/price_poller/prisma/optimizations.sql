-- Performance optimizations for TimescaleDB trading platform

-- 1. Create hypertables for time-series data (if not already done)
SELECT create_hypertable('trade', 'timestamp', if_not_exists => TRUE);

-- 2. Critical indexes for trading queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_symbol_timestamp 
ON trade (symbol, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_timestamp_symbol 
ON trade (timestamp DESC, symbol);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_trade_id 
ON trade (trade_id);

-- 3. Partial indexes for active trading
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_recent 
ON trade (symbol, timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '24 hours';

-- 4. Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_symbol_price_timestamp 
ON trade (symbol, price, timestamp DESC);

-- 5. Candlestick data tables with proper partitioning
CREATE TABLE IF NOT EXISTS candles_1m (
    symbol VARCHAR(20) NOT NULL,
    bucket TIMESTAMPTZ NOT NULL,
    open BIGINT NOT NULL,
    high BIGINT NOT NULL,
    low BIGINT NOT NULL,
    close BIGINT NOT NULL,
    volume BIGINT NOT NULL,
    PRIMARY KEY (symbol, bucket)
);

CREATE TABLE IF NOT EXISTS candles_1h (
    symbol VARCHAR(20) NOT NULL,
    bucket TIMESTAMPTZ NOT NULL,
    open BIGINT NOT NULL,
    high BIGINT NOT NULL,
    low BIGINT NOT NULL,
    close BIGINT NOT NULL,
    volume BIGINT NOT NULL,
    PRIMARY KEY (symbol, bucket)
);

CREATE TABLE IF NOT EXISTS candles_1d (
    symbol VARCHAR(20) NOT NULL,
    bucket TIMESTAMPTZ NOT NULL,
    open BIGINT NOT NULL,
    high BIGINT NOT NULL,
    low BIGINT NOT NULL,
    close BIGINT NOT NULL,
    volume BIGINT NOT NULL,
    PRIMARY KEY (symbol, bucket)
);

-- 6. Convert to hypertables
SELECT create_hypertable('candles_1m', 'bucket', if_not_exists => TRUE);
SELECT create_hypertable('candles_1h', 'bucket', if_not_exists => TRUE);
SELECT create_hypertable('candles_1d', 'bucket', if_not_exists => TRUE);

-- 7. Indexes for candle queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_candles_1m_symbol_bucket 
ON candles_1m (symbol, bucket DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_candles_1h_symbol_bucket 
ON candles_1h (symbol, bucket DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_candles_1d_symbol_bucket 
ON candles_1d (symbol, bucket DESC);

-- 8. Continuous aggregates for real-time analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS candle_1m_agg
WITH (timescaledb.continuous) AS
SELECT 
    symbol,
    time_bucket('1 minute', timestamp) AS bucket,
    first(price, timestamp) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, timestamp) AS close,
    sum(quantity) AS volume
FROM trade
GROUP BY symbol, bucket;

-- 9. Refresh policy for continuous aggregates
SELECT add_continuous_aggregate_policy('candle_1m_agg',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');

-- 10. Compression policy for old data
SELECT add_compression_policy('trade', INTERVAL '7 days');
SELECT add_compression_policy('candles_1m', INTERVAL '30 days');
SELECT add_compression_policy('candles_1h', INTERVAL '90 days');

-- 11. Data retention policies
SELECT add_retention_policy('trade', INTERVAL '90 days');
SELECT add_retention_policy('candles_1m', INTERVAL '1 year');
SELECT add_retention_policy('candles_1h', INTERVAL '2 years');

-- 12. Query optimization settings
ALTER SYSTEM SET shared_preload_libraries = 'timescaledb';
ALTER SYSTEM SET timescaledb.max_background_workers = 8;
ALTER SYSTEM SET max_worker_processes = 16;
ALTER SYSTEM SET max_parallel_workers = 16;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
