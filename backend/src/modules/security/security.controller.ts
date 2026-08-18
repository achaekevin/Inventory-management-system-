import { Response, NextFunction } from 'express';
import securityService from './security.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class SecurityController {
  // ==================== 2FA ====================

  async generate2FASecret(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await securityService.generateTwoFactorSecret(userId);
      ResponseHandler.success(res, result, '2FA secret generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async enable2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { code } = req.body;
      const result = await securityService.enableTwoFactor(userId, code);
      ResponseHandler.success(res, result, '2FA enabled successfully');
    } catch (error) {
      next(error);
    }
  }

  async disable2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await securityService.disableTwoFactor(userId);
      ResponseHandler.success(res, result, '2FA disabled successfully');
    } catch (error) {
      next(error);
    }
  }

  async get2FAStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const status = await securityService.getTwoFactorStatus(userId);
      ResponseHandler.success(res, status, '2FA status retrieved');
    } catch (error) {
      next(error);
    }
  }

  // ==================== SESSIONS ====================

  async getSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const token = req.headers.authorization?.split(' ')[1];
      const sessions = await securityService.getUserSessions(userId, token);
      ResponseHandler.success(res, sessions, 'Active sessions retrieved');
    } catch (error) {
      next(error);
    }
  }

  async revokeSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const result = await securityService.revokeSession(userId, id as string);
      ResponseHandler.success(res, result, 'Session revoked');
    } catch (error) {
      next(error);
    }
  }

  async revokeOtherSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const token = req.headers.authorization?.split(' ')[1];
      const result = await securityService.revokeAllOtherSessions(userId, token);
      ResponseHandler.success(res, result, 'All other sessions revoked');
    } catch (error) {
      next(error);
    }
  }

  // ==================== LOGIN HISTORY ====================

  async getLoginHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await securityService.getLoginHistory(userId);
      ResponseHandler.success(res, history, 'Login history retrieved');
    } catch (error) {
      next(error);
    }
  }

  // ==================== PASSWORD POLICY ====================

  async getPasswordPolicy(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await securityService.getPasswordPolicy();
      ResponseHandler.success(res, policy, 'Password policy retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updatePasswordPolicy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await securityService.updatePasswordPolicy(req.body);
      ResponseHandler.success(res, policy, 'Password policy updated');
    } catch (error) {
      next(error);
    }
  }

  // ==================== API TOKENS ====================

  async getApiTokens(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const tokens = await securityService.getApiTokens(userId);
      ResponseHandler.success(res, tokens, 'API tokens retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createApiToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, scopes } = req.body;
      const result = await securityService.createApiToken(userId, name || 'API Key', scopes);
      ResponseHandler.created(res, result, 'API token created');
    } catch (error) {
      next(error);
    }
  }

  async revokeApiToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const result = await securityService.revokeApiToken(userId, id as string);
      ResponseHandler.success(res, result, 'API token revoked');
    } catch (error) {
      next(error);
    }
  }
}

export default new SecurityController();
