import { config } from './env';
import Logger from '../utils/logger';

export const validateEnvironment = () => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    Logger.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  // Validate JWT secrets length
  if (config.JWT_SECRET.length < 32) {
    Logger.warn('⚠️ JWT_SECRET is too short. Use at least 32 characters in production.');
  }

  if (config.JWT_REFRESH_SECRET.length < 32) {
    Logger.warn('⚠️ JWT_REFRESH_SECRET is too short. Use at least 32 characters in production.');
  }

  // Validate database connection in production
  if (config.NODE_ENV === 'production') {
    if (!config.DATABASE_URL) {
      Logger.error('❌ DATABASE_URL is required in production');
      process.exit(1);
    }
  }

  Logger.info('✅ Environment validation passed');
};