-- Zero Sum X Database Initialization
-- Run this in Neon SQL Editor

-- Create trades table
CREATE TABLE IF NOT EXISTS trade (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  price BIGINT NOT NULL,
  trade_id BIGINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  quantity BIGINT NOT NULL,
  UNIQUE(trade_id, timestamp)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_symbol_timestamp ON trade(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trade_timestamp ON trade(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trade_symbol ON trade(symbol);

-- Create candles tables for different timeframes
CREATE TABLE IF NOT EXISTS candles_1m (
  symbol VARCHAR(20) NOT NULL,
  bucket TIMESTAMPTZ NOT NULL,
  open BIGINT NOT NULL,
  high BIGINT NOT NULL,
  low BIGINT NOT NULL,
  close BIGINT NOT NULL,
  volume BIGINT DEFAULT 0,
  PRIMARY KEY (symbol, bucket)
);

CREATE TABLE IF NOT EXISTS candles_1h (
  symbol VARCHAR(20) NOT NULL,
  bucket TIMESTAMPTZ NOT NULL,
  open BIGINT NOT NULL,
  high BIGINT NOT NULL,
  low BIGINT NOT NULL,
  close BIGINT NOT NULL,
  volume BIGINT DEFAULT 0,
  PRIMARY KEY (symbol, bucket)
);

CREATE TABLE IF NOT EXISTS candles_1d (
  symbol VARCHAR(20) NOT NULL,
  bucket TIMESTAMPTZ NOT NULL,
  open BIGINT NOT NULL,
  high BIGINT NOT NULL,
  low BIGINT NOT NULL,
  close BIGINT NOT NULL,
  volume BIGINT DEFAULT 0,
  PRIMARY KEY (symbol, bucket)
);

-- Create indexes for candles
CREATE INDEX IF NOT EXISTS idx_candles_1m_symbol_bucket ON candles_1m(symbol, bucket DESC);
CREATE INDEX IF NOT EXISTS idx_candles_1h_symbol_bucket ON candles_1h(symbol, bucket DESC);
CREATE INDEX IF NOT EXISTS idx_candles_1d_symbol_bucket ON candles_1d(symbol, bucket DESC);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance_cents BIGINT DEFAULT 50000000, -- $500,000 in cents
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  type VARCHAR(20) NOT NULL, -- 'market' or 'limit'
  quantity BIGINT NOT NULL,
  price BIGINT,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'filled', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ,
  pnl_cents BIGINT DEFAULT 0
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Insert demo user
INSERT INTO users (email, password_hash, balance_cents) 
VALUES ('demo@example.com', '$2b$10$demo.hash.for.testing', 50000000)
ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
