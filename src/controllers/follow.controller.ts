import { Request, Response } from 'express';
import { followService } from '../services/follow.service';
import { sendSuccess, sendError, sendNotFound, sendUnauthorized, sendConflict } from '../utils/response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class FollowController {
  // Follow user
  async followUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const username = Array.isArray(req.params.username)
  ? req.params.username[0]
  : req.params.username;

      const result = await followService.followUser(req.user.id, username);

      return sendSuccess(res, result, `You are now following @${username}`);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return sendNotFound(res, error.message);
      }
      if (error.message === 'Already following this user') {
        return sendConflict(res, error.message);
      }
      return sendError(res, error.message || 'Failed to follow user');
    }
  }

  // Unfollow user
  async unfollowUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const username = Array.isArray(req.params.username)
  ? req.params.username[0]
  : req.params.username;

      await followService.unfollowUser(req.user.id, username);

      return sendSuccess(res, null, `You have unfollowed @${username}`);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to unfollow user');
    }
  }

  // Get followers of a user
  async getFollowers(req: Request, res: Response) {
    try {
      const username = Array.isArray(req.params.username)
  ? req.params.username[0]
  : req.params.username;

      const followers = await followService.getFollowers(username);

      return sendSuccess(res, followers, 'Followers retrieved successfully');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to get followers');
    }
  }

  // Get users followed by a user
  async getFollowing(req: Request, res: Response) {
    try {
      const username = Array.isArray(req.params.username)
  ? req.params.username[0]
  : req.params.username;

      const following = await followService.getFollowing(username);

      return sendSuccess(res, following, 'Following list retrieved successfully');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to get following list');
    }
  }

  // Check if current user is following another user
  async checkFollowing(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.json({ isFollowing: false });
      }

      const username = Array.isArray(req.params.username)
  ? req.params.username[0]
  : req.params.username;

      const isFollowing = await followService.isFollowing(req.user.id, username);

      return sendSuccess(res, { isFollowing }, 'Follow status retrieved');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return sendNotFound(res, error.message);
      }
      return sendError(res, error.message || 'Failed to check follow status');
    }
  }
}

export const followController = new FollowController();