import { getOne, query, exists } from '../utils/db.utils';
import { User, CreateUserRepoInput } from '../models/user.model';

export class UserRepository {
  // Create new user - Disesuaikan dengan interface CreateUserRepoInput kamu
  async create(userData: CreateUserRepoInput, passwordHash: string): Promise<User> {
    const { email, username, bio } = userData;

    console.log('Repository - Creating user with bio:', bio);

    const result = await getOne<User>(
      `INSERT INTO users (email, username, password_hash, bio)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
      [email, username, passwordHash, bio || null],
    );

    if (!result) throw new Error('Failed to create user');

    console.log('Repository - User created with bio:', result.bio);
    return result;
  }

  async findById(id: string): Promise<User | null> {
    return getOne<User>('SELECT * FROM users WHERE id = $1', [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    return getOne<User>('SELECT * FROM users WHERE email = $1', [email]);
  }

  async findByUsername(username: string): Promise<User | null> {
    return getOne<User>('SELECT * FROM users WHERE username = $1', [username]);
  }

  async getPublicProfile(id: string): Promise<Partial<User> | null> {
    return getOne<User>('SELECT id, email, username, bio, created_at FROM users WHERE id = $1', [
      id,
    ]);
  }

  // Update User - Menggunakan logika index dinamis yang aman
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.username !== undefined) {
      fields.push(`username = $${index++}`);
      values.push(data.username);
    }

    if (data.bio !== undefined) {
      fields.push(`bio = $${index++}`);
      values.push(data.bio);
    }

    // Jika tidak ada data yang dikirim untuk diupdate
    if (fields.length === 0) return this.findById(id);

    values.push(id); // ID selalu jadi parameter terakhir
    const queryText = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${index} 
      RETURNING *
    `;

    return getOne<User>(queryText, values);
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    return exists('SELECT 1 FROM users WHERE email = $1', [email]);
  }

  async usernameExists(username: string): Promise<boolean> {
    return exists('SELECT 1 FROM users WHERE username = $1', [username]);
  }

  async getFollowersCount(userId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM follows WHERE following_id = $1',
      [userId],
    );
    return parseInt(result?.count || '0');
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
      [userId],
    );
    return parseInt(result?.count || '0');
  }

  async getStoriesCount(userId: string): Promise<number> {
    const result = await getOne<{ count: string }>(
      'SELECT COUNT(*) FROM stories WHERE author_id = $1',
      [userId],
    );
    return parseInt(result?.count || '0');
  }
}

export const userRepository = new UserRepository();
