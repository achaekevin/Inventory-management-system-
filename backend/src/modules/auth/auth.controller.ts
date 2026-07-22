import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';
import config from '../../config/env';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      ResponseHandler.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.get('user-agent') || '';

      const result = await authService.login(req.body, ipAddress, userAgent);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ResponseHandler.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new Error('Refresh token is required'));
      }

      const tokens = await authService.refreshToken(refreshToken);

      // Update refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ResponseHandler.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      await authService.logout(accessToken, refreshToken);

      // Clear cookies
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      ResponseHandler.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { oldPassword, newPassword } = req.body;

      await authService.changePassword(userId, oldPassword, newPassword);

      ResponseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await authService.forgotPassword(req.body.email);
      ResponseHandler.success(res, null, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      ResponseHandler.success(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      ResponseHandler.success(res, req.user, 'Current user retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
