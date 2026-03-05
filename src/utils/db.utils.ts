import { pool } from '../config/database';
import Logger from './logger';
import { QueryResult, QueryResultRow } from 'pg';

// Helper untuk menjalankan query dengan error handling
export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = 
    await pool.query<T>(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      Logger.warn(`Slow query (${duration}ms): ${text}`);
    }

    return result;
  } catch (error) {
    Logger.error('Database query error:', error);
    throw error;
  }
};

// Helper untuk mendapatkan satu row atau null
export const getOne = async <T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T | null> => {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
};

// Helper untuk mendapatkan banyak rows
export const getMany = async <T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T[]> => {
  const result = await query<T>(text, params);
  return result.rows;
};

// Helper untuk check if exists
export const exists = async (
  text: string,
  params?: any[]
): Promise<boolean> => {
  const result = await query(text, params);
  return (result.rowCount ?? 0) > 0;
};

// Helper untuk transaction
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};