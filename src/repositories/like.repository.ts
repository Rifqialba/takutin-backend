import { getOne, query, exists } from '../utils/db.utils';
import { Like, CreateLikeInput } from '../models/like.model';

export class LikeRepository {
  // Add like
  async create(data: CreateLikeInput): Promise<Like> {
    const { user_id, story_id } = data;
    
    const result = await getOne<Like>(
      `INSERT INTO likes (user_id, story_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, story_id) DO NOTHING
       RETURNING *`,
      [user_id, story_id]
    );
    
    if (!result) {
      // If conflict, it means already liked
      throw new Error('Already liked this story');
    }
    
    return result;
  }

  // Remove like
  async delete(userId: string, storyId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM likes WHERE user_id = $1 AND story_id = $2',
      [userId, storyId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Check if user liked story
  async hasLiked(userId: string, storyId: string): Promise<boolean> {
    return exists(
      'SELECT 1 FROM likes WHERE user_id = $1 AND story_id = $2',
      [userId, storyId]
    );
  }

  // Get like count for a story
  async getCountByStoryId(storyId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM likes WHERE story_id = $1',
      [storyId]
    );
    return parseInt(result?.count || '0');
  }

  // Get stories liked by user
  async getUserLikedStories(userId: string): Promise<string[]> {
    const results = await getOne<{ story_ids: string[] }>(
      `SELECT array_agg(story_id) as story_ids
       FROM likes
       WHERE user_id = $1`,
      [userId]
    );
    return results?.story_ids || [];
  }

  // Get like count for multiple stories (for batch queries)
  async getCountsForStories(storyIds: string[]): Promise<Map<string, number>> {
    const results = await getOne<{ story_id: string; count: string }[]>(
      `SELECT story_id, COUNT(*) as count
       FROM likes
       WHERE story_id = ANY($1::uuid[])
       GROUP BY story_id`,
      [storyIds]
    );
    
    const map = new Map<string, number>();
    results?.forEach(row => {
      map.set(row.story_id, parseInt(row.count));
    });
    
    return map;
  }
}

export const likeRepository = new LikeRepository();