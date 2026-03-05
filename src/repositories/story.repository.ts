import { getOne, getMany, query } from '../utils/db.utils';
import { Story, CreateStoryInput, UpdateStoryInput, StoryWithAuthor } from '../models/story.model';

export class StoryRepository {
  // Create new story
  async create(authorId: string, data: CreateStoryInput): Promise<Story> {
    const { title, content, excerpt, cover_image, status = 'draft' } = data;
    
    const result = await getOne<Story>(
      `INSERT INTO stories (title, content, excerpt, cover_image, author_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, content, excerpt || null, cover_image || null, authorId, status]
    );
    
    if (!result) throw new Error('Failed to create story');
    return result;
  }

  // Find story by ID (basic)
  async findById(id: string): Promise<Story | null> {
    return getOne<Story>(
      'SELECT * FROM stories WHERE id = $1',
      [id]
    );
  }

  // Find story by ID with author details
  async findByIdWithAuthor(id: string): Promise<StoryWithAuthor | null> {
    const result = await getOne<StoryWithAuthor>(
      `SELECT 
        s.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as author,
        (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    
    return result;
  }

  // Get published stories with pagination
  async getPublishedStories(
    limit: number = 10,
    offset: number = 0
  ): Promise<StoryWithAuthor[]> {
    return getMany<StoryWithAuthor>(
      `SELECT 
        s.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as author,
        (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.status = 'published'
       ORDER BY s.published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  }

  // Get stories by author
  async getByAuthor(
    authorId: string,
    status?: 'draft' | 'published',
    limit: number = 10,
    offset: number = 0
  ): Promise<Story[]> {
    let query_text = 'SELECT * FROM stories WHERE author_id = $1';
    const params: any[] = [authorId];
    let paramCount = 2;

    if (status) {
      query_text += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query_text += ' ORDER BY created_at DESC LIMIT $' + paramCount++ + ' OFFSET $' + paramCount++;
    params.push(limit, offset);

    return getMany<Story>(query_text, params);
  }

  // Update story
 // Ganti fungsi update kamu dengan kode ini:
async update(id: string, data: Partial<Story>) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(data.title);
  }

  if (data.content !== undefined) {
    fields.push(`content = $${index++}`);
    values.push(data.content);
  }

  if (data.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(data.status);
  }

  if (fields.length === 0) return null;

  // Masukkan id sebagai parameter terakhir
  values.push(id);
  const idIndex = index; // Gunakan index yang sudah increment terakhir

  const queryText = `
    UPDATE stories
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${idIndex}
    RETURNING *
  `;

  return getOne(queryText, values);
}

  // Delete story
  async delete(id: string, authorId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM stories WHERE id = $1 AND author_id = $2',
      [id, authorId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    await query(
      'UPDATE stories SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );
  }

  // Search stories
  async search(query_text: string, limit: number = 10): Promise<StoryWithAuthor[]> {
    return getMany<StoryWithAuthor>(
      `SELECT 
        s.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as author,
        (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.status = 'published' 
         AND (s.title ILIKE $1 OR s.content ILIKE $1)
       ORDER BY s.published_at DESC
       LIMIT $2`,
      [`%${query_text}%`, limit]
    );
  }

  // Get trending stories (most views/likes in last 7 days)
  async getTrending(limit: number = 5): Promise<StoryWithAuthor[]> {
    return getMany<StoryWithAuthor>(
      `SELECT 
        s.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as author,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
       FROM stories s
       JOIN users u ON s.author_id = u.id
       LEFT JOIN likes l ON s.id = l.story_id AND l.created_at > NOW() - INTERVAL '7 days'
       LEFT JOIN comments c ON s.id = c.story_id AND c.created_at > NOW() - INTERVAL '7 days'
       WHERE s.status = 'published'
       GROUP BY s.id, u.id
       ORDER BY (s.view_count + COUNT(DISTINCT l.id) * 2) DESC
       LIMIT $1`,
      [limit]
    );
  }
  // Get total published stories count
async getPublishedCount(): Promise<number> {
  const result = await getOne<{ count: string }>(
    `SELECT COUNT(*) FROM stories WHERE status = 'published'`
  );

  return parseInt(result?.count || '0');
}
}


export const storyRepository = new StoryRepository();