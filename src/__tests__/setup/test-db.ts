import { pool } from '../../config/database';

export const cleanDatabase = async () => {
  await pool.query(`
    TRUNCATE TABLE
      users,
      stories,
      follows,
      likes,
      comments,
      bookmarks
    RESTART IDENTITY CASCADE;
  `);
};