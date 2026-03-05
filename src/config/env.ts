import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;

  // Database
  DATABASE_URL?: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Bcrypt
  BCRYPT_SALT_ROUNDS: number;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Logging
  LOG_LEVEL: string;

  // CORS (TAMBAHKAN INI)
  CORS_ORIGIN?: string;
}

const getEnvVar = (key: keyof EnvConfig, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnvVar = (key: keyof EnvConfig, defaultValue?: string): string => {
  return process.env[key] || defaultValue || '';
};

export const config: EnvConfig = {
  // Server
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  API_PREFIX: getEnvVar('API_PREFIX', '/api/v1'),

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: getEnvVar('DB_HOST', 'localhost'),
  DB_PORT: parseInt(getEnvVar('DB_PORT', '5432'), 10),
  DB_NAME: getEnvVar('DB_NAME', 'postgres'),
  DB_USER: getEnvVar('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', 'postgres'),

  // Redis
  REDIS_HOST: getEnvVar('REDIS_HOST', 'localhost'),
  REDIS_PORT: parseInt(getEnvVar('REDIS_PORT', '6379'), 10),
  REDIS_PASSWORD: getOptionalEnvVar('REDIS_PASSWORD'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(getEnvVar('BCRYPT_SALT_ROUNDS', '10'), 10),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '1000'), 10),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'debug'),

  // CORS (opsional)
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
