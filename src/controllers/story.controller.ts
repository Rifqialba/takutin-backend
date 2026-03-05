import { Request, Response } from 'express';
import { storyService } from '../services/story.service';
import { commentService } from '../services/comment.service';
import { sendSuccess, sendError, sendNotFound, sendUnauthorized } from '../utils/response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class StoryController {
  // Create story
  async createStory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const { title, content, excerpt, cover_image, status } = req.body;

      const story = await storyService.createStory(
        req.user.id,
        { title, content, excerpt, cover_image, status }
      );

      return sendSuccess(res, story, 'Story created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create story');
    }
  }

  // Get story by ID
  async getStoryById(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
      const userId = req.user?.id;

      const story = await storyService.getStoryById(id, userId);

      return sendSuccess(res, story, 'Story retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to get story');
    }
  }

  // Get published stories (public feed)
  async getPublishedStories(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await storyService.getPublishedStories(page, limit);

      return sendSuccess(res, result.stories, 'Stories retrieved successfully', 200, result.meta);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get stories');
    }
  }

  // Get stories by author username
  async getStoriesByAuthor(req: AuthRequest, res: Response) {
    try {
      const username = Array.isArray(req.params.username)
  ? req.params.username[0]
  : req.params.username;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const viewerId = req.user?.id;

      const result = await storyService.getStoriesByAuthor(username, viewerId, page, limit);

      return sendSuccess(res, result, 'Author stories retrieved successfully');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to get author stories');
    }
  }

  // Update story
  async updateStory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
      const { title, content, excerpt, cover_image, status } = req.body;

      const updatedStory = await storyService.updateStory(
        id,
        req.user.id,
        { title, content, excerpt, cover_image, status }
      );

      return sendSuccess(res, updatedStory, 'Story updated successfully');
    } catch (error: any) {
      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to update story');
    }
  }

  // Delete story
  async deleteStory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

      await storyService.deleteStory(id, req.user.id);

      return sendSuccess(res, null, 'Story deleted successfully');
    } catch (error: any) {
      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to delete story');
    }
  }

  // Search stories
  async searchStories(req: Request, res: Response) {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q) {
        return sendSuccess(res, [], 'No search query provided');
      }

      const stories = await storyService.searchStories(q as string, limit);

      return sendSuccess(res, stories, 'Search results retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to search stories');
    }
  }

  // Get trending stories
  async getTrendingStories(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const stories = await storyService.getTrendingStories(limit);

      return sendSuccess(res, stories, 'Trending stories retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get trending stories');
    }
  }

  // Toggle like on story
  async toggleLike(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

      const result = await storyService.toggleLike(id, req.user.id);

      return sendSuccess(res, result, result.liked ? 'Story liked' : 'Story unliked');
    } catch (error: any) {
      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to toggle like');
    }
  }

  // Get comments for a story
  async getStoryComments(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

      const comments = await commentService.getStoryComments(id);

      return sendSuccess(res, comments, 'Comments retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to get comments');
    }
  }

  // Add comment to story
  async addComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
      const { content } = req.body;

      const comment = await commentService.createComment(id, req.user.id, content);

      return sendSuccess(res, comment, 'Comment added successfully', 201);
    } catch (error: any) {
      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to add comment');
    }
  }
}

export const storyController = new StoryController();