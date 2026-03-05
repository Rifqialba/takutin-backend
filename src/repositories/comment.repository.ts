import { getOne, getMany, query } from '../utils/db.utils';
import { Comment, CreateCommentInput, UpdateCommentInput, CommentWithUser } from '../models/comment.model';

export class CommentRepository {
  // Create comment
  async create(data: CreateCommentInput): Promise<Comment> {
    const { content, story_id, user_id } = data;
    
    const result = await getOne<Comment>(
      `INSERT INTO comments (content, story_id, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [content, story_id, user_id]
    );
    
    if (!result) throw new Error('Failed to create comment');
    return result;
  }

  // Get comment by ID
  async findById(id: string): Promise<Comment | null> {
    return getOne<Comment>(
      'SELECT * FROM comments WHERE id = $1',
      [id]
    );
  }

  // Get comments for a story with user details
  async getByStoryId(storyId: string): Promise<CommentWithUser[]> {
    return getMany<CommentWithUser>(
      `SELECT 
        c.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as user
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.story_id = $1
       ORDER BY c.created_at DESC`,
      [storyId]
    );
  }

  // Update comment
  async update(id: string, userId: string, data: UpdateCommentInput): Promise<Comment | null> {
    const result = await getOne<Comment>(
      `UPDATE comments 
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [data.content, id, userId]
    );
    
    return result;
  }

  // Delete comment
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Delete all comments on a story (when story is deleted, handled by CASCADE)
  
  // Get comment count for a story
  async getCountByStoryId(storyId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM comments WHERE story_id = $1',
      [storyId]
    );
    return parseInt(result?.count || '0');
  }
}

export const commentRepository = new CommentRepository();