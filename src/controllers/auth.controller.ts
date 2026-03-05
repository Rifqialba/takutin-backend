import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError, sendUnauthorized, sendConflict } from '../utils/response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  // Register
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;

      const result = await authService.register({ email, username, password });

      return sendSuccess(
        res, 
        result, 
        'Registration successful', 
        201
      );
    } catch (error: any) {
      if (error.message.includes('already registered') || 
          error.message.includes('already taken')) {
        return sendConflict(res, error.message);
      }
      return sendError(res, error.message || 'Registration failed');
    }
  }

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      return sendUnauthorized(res, error.message || 'Login failed');
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);

      return sendSuccess(res, tokens, 'Token refreshed');
    } catch (error: any) {
      return sendUnauthorized(res, error.message || 'Invalid refresh token');
    }
  }

  // Get current user
  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const user = await authService.getCurrentUser(req.user.id);

      return sendSuccess(res, user, 'User profile retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get profile');
    }
  }

  // Update profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const { email, username, bio, avatar_url } = req.body;

      const updatedUser = await authService.updateProfile(
        req.user.id, 
        { email, username, bio, avatar_url }
      );

      return sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error: any) {
      if (error.message.includes('already taken')) {
        return sendConflict(res, error.message);
      }
      return sendError(res, error.message || 'Failed to update profile');
    }
  }
}

export const authController = new AuthController();