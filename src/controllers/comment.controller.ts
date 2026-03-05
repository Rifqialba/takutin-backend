import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';
import { sendSuccess, sendError, sendNotFound, sendUnauthorized } from '../utils/response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class CommentController {
  // Update comment
  async updateComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
      const { content } = req.body;

      const updatedComment = await commentService.updateComment(id, req.user.id, content);

      return sendSuccess(res, updatedComment, 'Comment updated successfully');
    } catch (error: any) {
      if (error.message === 'Comment not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to update comment');
    }
  }

  // Delete comment
  async deleteComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

      await commentService.deleteComment(id, req.user.id);

      return sendSuccess(res, null, 'Comment deleted successfully');
    } catch (error: any) {
      if (error.message === 'Comment not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to delete comment');
    }
  }
}

export const commentController = new CommentController();