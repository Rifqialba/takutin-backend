import { getOne, getMany, query, exists } from '../utils/db.utils';

export interface Bookmark {
  id: string;
  user_id: string;
  story_id: string;
  created_at: Date;
}

export interface CreateBookmarkInput {
  user_id: string;
  story_id: string;
}

export class BookmarkRepository {
  // Create bookmark
  async create(data: CreateBookmarkInput): Promise<Bookmark> {
    const { user_id, story_id } = data;

    const result = await getOne<Bookmark>(
      `INSERT INTO bookmarks (user_id, story_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, story_id],
    );

    if (!result) throw new Error('Failed to create bookmark');
    return result;
  }

  // Delete bookmark
  async delete(userId: string, storyId: string): Promise<boolean> {
    const result = await query('DELETE FROM bookmarks WHERE user_id = $1 AND story_id = $2', [
      userId,
      storyId,
    ]);
    return (result.rowCount ?? 0) > 0;
  }

  // Check if bookmarked
  async isBookmarked(userId: string, storyId: string): Promise<boolean> {
    return exists('SELECT 1 FROM bookmarks WHERE user_id = $1 AND story_id = $2', [
      userId,
      storyId,
    ]);
  }

  // Get user's bookmarks
  async getUserBookmarks(userId: string): Promise<string[]> {
    const results = await getOne<{ story_ids: string[] }>(
      `SELECT array_agg(story_id ORDER BY created_at DESC) as story_ids
       FROM bookmarks
       WHERE user_id = $1`,
      [userId],
    );
    return results?.story_ids || [];
  }

  // Get bookmark count for a story
  async getCountByStoryId(storyId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM bookmarks WHERE story_id = $1',
      [storyId],
    );
    return parseInt(result?.count || '0');
  }
}

export const bookmarkRepository = new BookmarkRepository();
