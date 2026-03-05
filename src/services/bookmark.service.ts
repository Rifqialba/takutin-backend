import { bookmarkRepository } from '../repositories/bookmark.repository';
import { storyRepository } from '../repositories/story.repository';

export class BookmarkService {
  async addBookmark(userId: string, storyId: string) {
    // Check if story exists
    const story = await storyRepository.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Check if already bookmarked
    const isBookmarked = await bookmarkRepository.isBookmarked(userId, storyId);
    if (isBookmarked) {
      throw new Error('Already bookmarked');
    }

    // Add bookmark
    const bookmark = await bookmarkRepository.create({
      user_id: userId,
      story_id: storyId
    });

    return bookmark;
  }

  async removeBookmark(userId: string, storyId: string) {
    const deleted = await bookmarkRepository.delete(userId, storyId);
    if (!deleted) {
      throw new Error('Bookmark not found');
    }
    return true;
  }

  async getUserBookmarks(userId: string) {
    const bookmarkIds = await bookmarkRepository.getUserBookmarks(userId);
    
    // Get full story details for each bookmark
    const stories = await Promise.all(
      bookmarkIds.map(id => storyRepository.findByIdWithAuthor(id))
    );

    return stories.filter(Boolean);
  }

  async isBookmarked(userId: string, storyId: string) {
    return bookmarkRepository.isBookmarked(userId, storyId);
  }
}

export const bookmarkService = new BookmarkService();