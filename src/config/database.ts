import { Pool } from 'pg';
import { config } from './env';
import Logger from '../utils/logger';

let pool: Pool;

if (config.DATABASE_URL) {
  Logger.info(`📊 Connecting to Neon database...`);

  pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5, // Kurangi untuk serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  // Set timezone ke UTC untuk sesi ini
  pool.on('connect', (client) => {
    client.query("SET TIME ZONE 'UTC';", (err) => {
      if (err) {
        Logger.error('❌ Failed to set timezone to UTC:', err);
      }
    });
  });
}

// Test connection - hanya untuk development
const testConnection = async () => {
  if (process.env.NODE_ENV === 'production') {
    return true; // Skip di production
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    Logger.info(`✅ Database connection test successful: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    Logger.error('❌ Database connection test failed:', error);
    throw error;
  }
};

export { pool, testConnection };
