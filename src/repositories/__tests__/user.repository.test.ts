/// <reference types="jest" />
import { userRepository } from '../user.repository';
import { pool } from '../../config/database';
import { cleanDatabase } from '../../__tests__/setup/test-db';

describe('User Repository', () => {
  // Gunakan ID unik untuk setiap rangkaian test agar tidak ada tabrakan di level DB
  const suffix = Date.now();
  const defaultUser = {
    email: `repo-${suffix}@test.com`,
    username: `user-${suffix}`,
    passwordHash: '$2b$10$XZr7L1qJ4kK5mN8oP3qR6uVwYxZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7'
  };

  // Bersihkan sekali di awal suite, bukan setiap 'it' untuk menghindari timeout
  beforeAll(async () => {
    try {
      await cleanDatabase();
      // Siapkan satu user utama untuk dites di fungsi-fungsi non-create
      await userRepository.create(
        { email: defaultUser.email, username: defaultUser.username },
        defaultUser.passwordHash
      );
    } catch (err) {
      console.error('Setup failed:', err);
    }
  });

  afterAll(async () => {
    // Berikan jeda sebentar sebelum menutup pool agar query terakhir selesai
    await new Promise(resolve => setTimeout(resolve, 500));
    await pool.end();
  });

  describe('create', () => {
    it('should create a new user with unique data', async () => {
      const uniqueData = {
        email: `new-${Date.now()}@test.com`,
        username: `newuser-${Math.random().toString(36).substring(7)}`
      };
      const user = await userRepository.create(uniqueData, defaultUser.passwordHash);
      expect(user).toBeDefined();
      expect(user.email).toBe(uniqueData.email);
    });

    it('should throw error for duplicate email', async () => {
      // Menggunakan defaultUser.email yang sudah diinsert di beforeAll
      await expect(
        userRepository.create(
          { email: defaultUser.email, username: 'completely_different' },
          defaultUser.passwordHash
        )
      ).rejects.toThrow();
    });

    it('should throw error for duplicate username', async () => {
      await expect(
        userRepository.create(
          { email: 'completely@different.com', username: defaultUser.username },
          defaultUser.passwordHash
        )
      ).rejects.toThrow();
    });
  });

  describe('lookup methods', () => {
    it('should find user by email', async () => {
      const user = await userRepository.findByEmail(defaultUser.email);
      expect(user?.email).toBe(defaultUser.email);
    });

    it('should find user by username', async () => {
      const user = await userRepository.findByUsername(defaultUser.username);
      expect(user?.username).toBe(defaultUser.username);
    });

    it('should return null for non-existent user', async () => {
      const user = await userRepository.findByEmail('ghost@test.com');
      expect(user).toBeNull();
    });
  });

  describe('profile and update', () => {
    it('should return public profile without password_hash', async () => {
      const user = await userRepository.findByEmail(defaultUser.email);
      const profile = await userRepository.getPublicProfile(user!.id);
      expect(profile).toBeDefined();
      expect(profile).not.toHaveProperty('password_hash');
    });

    it('should update bio and return updated user', async () => {
      const user = await userRepository.findByEmail(defaultUser.email);
      const updated = await userRepository.update(user!.id, { bio: 'New Bio' });
      expect(updated?.bio).toBe('New Bio');
    });
  });

  describe('existence and counts', () => {
    it('should verify email and username existence', async () => {
      const emailExists = await userRepository.emailExists(defaultUser.email);
      const userExists = await userRepository.usernameExists(defaultUser.username);
      expect(emailExists).toBe(true);
      expect(userExists).toBe(true);
    });

    it('should return numeric counts', async () => {
      const user = await userRepository.findByEmail(defaultUser.email);
      const count = await userRepository.getStoriesCount(user!.id);
      expect(typeof count).toBe('number');
    });
  });

  describe('delete', () => {
    it('should delete existing user', async () => {
      // Buat satu user khusus untuk dihapus
      const tempUser = await userRepository.create(
        { email: `del-${Date.now()}@test.com`, username: `del-${Date.now()}` },
        defaultUser.passwordHash
      );
      const deleted = await userRepository.delete(tempUser.id);
      expect(deleted).toBe(true);
    });
  });
});