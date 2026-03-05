import { userRepository } from '../repositories/user.repository';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/auth.utils';
import { CreateUserInput, UpdateUserInput } from '../models/user.model';

export class AuthService {
  // Register new user
  async register(userData: CreateUserInput) {
    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // LOG untuk debugging
    console.log('Register - userData:', userData);
    console.log('Bio received:', userData.bio);

    // Create user - SERTAKAN BIO
    const user = await userRepository.create(
      {
        email: userData.email,
        username: userData.username,
        bio: userData.bio || null, // Pastikan bio dikirim
      },
      passwordHash,
    );

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Get public profile
    const profile = await userRepository.getPublicProfile(user.id);

    return {
      user: profile,
      ...tokens,
    };
  }

  // Login user
  async login(email: string, password: string) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Get public profile
    const profile = await userRepository.getPublicProfile(user.id);

    return {
      user: profile,
      ...tokens,
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Check if user still exists
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Get current user profile
  async getCurrentUser(userId: string) {
    const user = await userRepository.getPublicProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get counts
    const [followersCount, followingCount, storiesCount] = await Promise.all([
      userRepository.getFollowersCount(userId),
      userRepository.getFollowingCount(userId),
      userRepository.getStoriesCount(userId),
    ]);

    return {
      ...user,
      followersCount,
      followingCount,
      storiesCount,
    };
  }

  // Update profile
  async updateProfile(userId: string, data: UpdateUserInput) {
    // If updating email, check if it's already taken
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already taken');
      }
    }

    // If updating username, check if it's already taken
    if (data.username) {
      const existingUser = await userRepository.findByUsername(data.username);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username already taken');
      }
    }

    // Update user
    const updatedUser = await userRepository.update(userId, data);
    if (!updatedUser) {
      throw new Error('Failed to update profile');
    }

    return updatedUser;
  }
}

export const authService = new AuthService();
