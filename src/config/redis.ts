import Redis from 'ioredis';
import { config } from './env';
import Logger from '../utils/logger';

const redisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  Logger.info('Redis connected successfully');
});

redisClient.on('error', (error) => {
  Logger.error('Redis connection error:', error);
});

// Test connection
const testRedisConnection = async () => {
  try {
    await redisClient.ping();
    Logger.info('Redis connection test successful');
  } catch (error) {
    Logger.error('Redis connection test failed:', error);
    throw error;
  }
};

export { redisClient, testRedisConnection };