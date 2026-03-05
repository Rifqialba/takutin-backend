import app from './app';
import { config } from './config/env';
import { testConnection as testDbConnection } from './config/database';
import { testRedisConnection } from './config/redis';
import Logger from './utils/logger';

const PORT = config.PORT;

// Untuk development lokal
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await testDbConnection();
      await testRedisConnection();

      app.listen(PORT, () => {
        Logger.info(`
        ╔════════════════════════════════════════════╗
        ║     🚀 Takutin Backend Server Started     ║
        ╠════════════════════════════════════════════╣
        ║  Environment: ${config.NODE_ENV.padEnd(20)} ║
        ║  Port: ${String(PORT).padEnd(25)} ║
        ╚════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      Logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

// Export untuk Vercel (WAJIB!)
export default app;
