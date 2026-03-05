import { getOne, getMany, query, exists } from '../utils/db.utils';
import { Follow, CreateFollowInput } from '../models/follow.model';

export class FollowRepository {
  // Follow user
  async create(data: CreateFollowInput): Promise<Follow> {
    const { follower_id, following_id } = data;
    
    if (follower_id === following_id) {
      throw new Error('Cannot follow yourself');
    }
    
    const result = await getOne<Follow>(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, following_id) DO NOTHING
       RETURNING *`,
      [follower_id, following_id]
    );
    
    if (!result) {
      throw new Error('Already following this user');
    }
    
    return result;
  }

  // Unfollow user
  async delete(followerId: string, followingId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Check if following
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return exists(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
  }

  // Get followers of a user
  async getFollowers(userId: string): Promise<string[]> {
    const results = await getOne<{ follower_ids: string[] }>(
      `SELECT array_agg(follower_id) as follower_ids
       FROM follows
       WHERE following_id = $1`,
      [userId]
    );
    return results?.follower_ids || [];
  }

  // Get users followed by a user
  async getFollowing(userId: string): Promise<string[]> {
    const results = await getOne<{ following_ids: string[] }>(
      `SELECT array_agg(following_id) as following_ids
       FROM follows
       WHERE follower_id = $1`,
      [userId]
    );
    return results?.following_ids || [];
  }

  // Get followers count
  async getFollowersCount(userId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM follows WHERE following_id = $1',
      [userId]
    );
    return parseInt(result?.count || '0');
  }

  // Get following count
  async getFollowingCount(userId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
      [userId]
    );
    return parseInt(result?.count || '0');
  }

  // Get stories from followed users (for feed)
  async getFeedStories(userId: string, limit: number = 10, offset: number = 0): Promise<string[]> {
    const results = await getOne<{ story_ids: string[] }>(
      `SELECT array_agg(s.id ORDER BY s.published_at DESC) as story_ids
       FROM stories s
       JOIN follows f ON s.author_id = f.following_id
       WHERE f.follower_id = $1
         AND s.status = 'published'
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return results?.story_ids || [];
  }
}

export const followRepository = new FollowRepository();