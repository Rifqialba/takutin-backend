import { commentRepository } from '../repositories/comment.repository';
import { storyRepository } from '../repositories/story.repository';
import { CreateCommentInput, UpdateCommentInput } from '../models/comment.model';

export class CommentService {
  // Create comment
  async createComment(storyId: string, userId: string, content: string) {
    // Check if story exists and is published
    const story = await storyRepository.findById(storyId);
    if (!story || story.status !== 'published') {
      throw new Error('Story not found');
    }

    const comment = await commentRepository.create({
      content,
      story_id: storyId,
      user_id: userId
    });

    // Get comment with user details
    const comments = await commentRepository.getByStoryId(storyId);
    return comments.find(c => c.id === comment.id);
  }

  // Get comments for a story
  async getStoryComments(storyId: string) {
    // Check if story exists
    const story = await storyRepository.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    return commentRepository.getByStoryId(storyId);
  }

  // Update comment
  async updateComment(commentId: string, userId: string, content: string) {
    // Check if comment exists and user is owner
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('You can only edit your own comments');
    }

    const updatedComment = await commentRepository.update(commentId, userId, { content });
    if (!updatedComment) {
      throw new Error('Failed to update comment');
    }

    return updatedComment;
  }

  // Delete comment
  async deleteComment(commentId: string, userId: string) {
    // Check if comment exists and user is owner
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('You can only delete your own comments');
    }

    const deleted = await commentRepository.delete(commentId, userId);
    if (!deleted) {
      throw new Error('Failed to delete comment');
    }

    return true;
  }
}

export const commentService = new CommentService();