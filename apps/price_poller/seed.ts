import "dotenv/config";
import { Client } from "pg";

const url = process.env.DATABASE_URL as string;
const client = new Client({ connectionString: url });

async function initializeTimescale() {
  await client.connect();

  await client.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);
  await client.query(`SELECT create_hypertable('"Trade"', 'timestamp', if_not_exists => TRUE);`);

  await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candles_1m
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('1 minute', timestamp) AS bucket,
      symbol,
      first(price, timestamp) AS open,
      MAX(price) AS high,
      MIN(price) AS low,
      last(price, timestamp) AS close,
      SUM(quantity) AS volume
    FROM "Trade"
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candles_1d
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('1 day', timestamp) AS bucket,
      symbol,
      first(price, timestamp) AS open,
      MAX(price) AS high,
      MIN(price) AS low,
      last(price, timestamp) AS close,
      SUM(quantity) AS volume
    FROM "Trade"
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candles_1w
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('1 week', timestamp) AS bucket,
      symbol,
      first(price, timestamp) AS open,
      MAX(price) AS high,
      MIN(price) AS low,
      last(price, timestamp) AS close,
      SUM(quantity) AS volume
    FROM "Trade"
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  await client.query(`
    SELECT add_continuous_aggregate_policy(
      'candles_1m',
      start_offset => INTERVAL '20 minutes',
      end_offset => INTERVAL '1 minute',
      schedule_interval => INTERVAL '30 seconds'
    );
  `);

  await client.query(`
    SELECT add_continuous_aggregate_policy(
      'candles_1d',
      start_offset => INTERVAL '2 months',
      end_offset => INTERVAL '1 day',
      schedule_interval => INTERVAL '1 hour'
    );
  `);

  await client.query(`
    SELECT add_continuous_aggregate_policy(
      'candles_1w',
      start_offset => INTERVAL '3 weeks',
      end_offset => INTERVAL '1 week',
      schedule_interval => INTERVAL '1 day'
    );
  `);

  await client.end();
  console.log("TimescaleDB hypertable + continuous aggregates initialized");
}

initializeTimescale().catch((err) => {
  console.error("seed error:", err);
  process.exit(1);
});


