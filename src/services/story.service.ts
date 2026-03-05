import { storyRepository } from '../repositories/story.repository';
import { likeRepository } from '../repositories/like.repository';
import { commentRepository } from '../repositories/comment.repository';
import { userRepository } from '../repositories/user.repository';
import { CreateStoryInput, UpdateStoryInput } from '../models/story.model';
import { getOne, getMany, query, exists } from '../utils/db.utils';

export class StoryService {
  // Create story
  async createStory(authorId: string, data: CreateStoryInput) {
    // Generate excerpt from content if not provided
    if (!data.excerpt && data.content) {
      // Take first 150 characters as excerpt
      data.excerpt = data.content.substring(0, 150) + '...';
    }

    const story = await storyRepository.create(authorId, data);
    return story;
  }

  // Get story by ID (public)
  async getStoryById(id: string, userId?: string) {
    const story = await storyRepository.findByIdWithAuthor(id);
    if (!story) {
      throw new Error('Story not found');
    }

    // Only return if published or user is author
    if (story.status !== 'published' && story.author_id !== userId) {
      throw new Error('Story not found');
    }

    // Increment view count if published and viewer is not author
    if (story.status === 'published' && story.author_id !== userId) {
      await storyRepository.incrementViews(id);
      story.view_count += 1;
    }

    // Check if user liked this story
    if (userId) {
      const liked = await likeRepository.hasLiked(userId, id);
      return { ...story, liked };
    }

    return story;
  }

  // Get published stories with pagination
  async getPublishedStories(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const stories = await storyRepository.getPublishedStories(limit, offset);

    // Get total count for pagination
    const total = await storyRepository.getPublishedCount();

    return {
      stories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get stories by author
  async getStoriesByAuthor(
    username: string, 
    viewerId?: string,
    page: number = 1, 
    limit: number = 10
  ) {
    // Find user by username
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const offset = (page - 1) * limit;

    // If viewer is the author, show all stories (including drafts)
    if (viewerId === user.id) {
      const stories = await storyRepository.getByAuthor(user.id, undefined, limit, offset);
      return {
        stories,
        author: {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          bio: user.bio
        }
      };
    }

    // Otherwise only show published stories
    const stories = await storyRepository.getByAuthor(user.id, 'published', limit, offset);
    return {
      stories,
      author: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio
      }
    };
  }

  // Update story
  async updateStory(storyId: string, userId: string, data: UpdateStoryInput) {
    // Check if story exists and user is author
    const story = await storyRepository.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (story.author_id !== userId) {
      throw new Error('You can only edit your own stories');
    }

    // Update story
    const updatedStory = await storyRepository.update(storyId, data);
    if (!updatedStory) {
      throw new Error('Failed to update story');
    }

    return updatedStory;
  }

  // Delete story
  async deleteStory(storyId: string, userId: string) {
    // Check if story exists and user is author
    const story = await storyRepository.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (story.author_id !== userId) {
      throw new Error('You can only delete your own stories');
    }

    const deleted = await storyRepository.delete(storyId, userId);
    if (!deleted) {
      throw new Error('Failed to delete story');
    }

    return true;
  }

  // Search stories
  async searchStories(query: string, limit: number = 10) {
    return storyRepository.search(query, limit);
  }

  // Get trending stories
  async getTrendingStories(limit: number = 5) {
    return storyRepository.getTrending(limit);
  }

  // Toggle like on story
  async toggleLike(storyId: string, userId: string) {
    // Check if story exists and is published
    const story = await storyRepository.findById(storyId);
    if (!story || story.status !== 'published') {
      throw new Error('Story not found');
    }

    const hasLiked = await likeRepository.hasLiked(userId, storyId);

    if (hasLiked) {
      // Unlike
      await likeRepository.delete(userId, storyId);
      return { liked: false };
    } else {
      // Like
      await likeRepository.create({ user_id: userId, story_id: storyId });
      return { liked: true };
    }
  }
}

export const storyService = new StoryService();