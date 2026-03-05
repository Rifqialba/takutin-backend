import { pool } from '../config/database';
import Logger from '../utils/logger';

const verifyTables = async () => {
  const tables = ['users', 'stories', 'comments', 'likes', 'follows', 'bookmarks'];
  
  try {
    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [table]
      );
      
      if (result.rows[0].exists) {
        Logger.info(`✅ Table '${table}' exists`);
        
        // Count rows
        const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        Logger.info(`   └─ ${count.rows[0].count} records`);
      } else {
        Logger.error(`❌ Table '${table}' does not exist`);
      }
    }
  } catch (error) {
    Logger.error('Error verifying tables:', error);
  } finally {
    await pool.end();
  }
};

verifyTables();