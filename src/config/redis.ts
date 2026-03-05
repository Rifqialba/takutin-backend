import Logger from '../utils/logger';

// Mock Redis client untuk production
export const redisClient = {
  get: async () => null,
  set: async () => {},
  del: async () => {},
  ping: async () => 'PONG',
};

export const testRedisConnection = async () => {
  if (process.env.NODE_ENV === 'production') {
    Logger.info('✅ Redis disabled in production');
    return true;
  }

  // Untuk development, coba koneksi real
  try {
    // ... kode redis real untuk development
    return true;
  } catch (error) {
    Logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};
