import { Request, Response } from 'express';
import { bookmarkService } from '../services/bookmark.service';
import { sendSuccess, sendError, sendUnauthorized, sendNotFound } from '../utils/response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class BookmarkController {
  // Helper function to get storyId from params
  private getStoryId(params: any): string {
    const storyId = params.storyId;
    // Jika array, ambil yang pertama
    if (Array.isArray(storyId)) {
      return storyId[0];
    }
    return storyId;
  }

  // Add bookmark
  addBookmark = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const storyId = this.getStoryId(req.params);

      if (!storyId) {
        return sendError(res, 'Story ID is required', 400);
      }

      const result = await bookmarkService.addBookmark(req.user.id, storyId);

      return sendSuccess(res, result, 'Cerita ditambahkan ke favorit');
    } catch (error: any) {
      console.error('Add bookmark error:', error);

      if (error.message === 'Story not found') {
        return sendNotFound(res, error.message);
      }
      if (error.message === 'Already bookmarked') {
        return sendError(res, error.message, 409);
      }
      return sendError(res, error.message || 'Failed to add bookmark');
    }
  };

  // Remove bookmark
  removeBookmark = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const storyId = this.getStoryId(req.params);

      if (!storyId) {
        return sendError(res, 'Story ID is required', 400);
      }

      await bookmarkService.removeBookmark(req.user.id, storyId);

      return sendSuccess(res, null, 'Cerita dihapus dari favorit');
    } catch (error: any) {
      console.error('Remove bookmark error:', error);

      if (error.message === 'Bookmark not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to remove bookmark');
    }
  };

  // Get user's bookmarks
  getUserBookmarks = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const bookmarks = await bookmarkService.getUserBookmarks(req.user.id);

      return sendSuccess(res, bookmarks, 'Bookmarks retrieved');
    } catch (error: any) {
      console.error('Get bookmarks error:', error);
      return sendError(res, error.message || 'Failed to get bookmarks');
    }
  };

  // Check if story is bookmarked
  isBookmarked = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.json({ data: false });
      }

      const storyId = this.getStoryId(req.params);

      if (!storyId) {
        return res.json({ data: false });
      }

      const isBookmarked = await bookmarkService.isBookmarked(req.user.id, storyId);

      return sendSuccess(res, isBookmarked);
    } catch (error: any) {
      console.error('Check bookmark error:', error);
      return sendError(res, error.message || 'Failed to check bookmark');
    }
  };
}

// Ekspor instance dengan method yang sudah di-binding
export const bookmarkController = new BookmarkController();
