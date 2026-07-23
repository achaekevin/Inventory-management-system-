import { Response, NextFunction } from 'express';
import userService from './user.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class UserController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        roleId: req.query.roleId as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await userService.getUsers(filters);
      ResponseHandler.success(res, result.data, 'Users retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = (req.params as any).id;
      const user = await userService.getUserById(targetUserId);
      ResponseHandler.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await userService.createUser(req.body, userId);
      ResponseHandler.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const targetUserId = (req.params as any).id;
      const user = await userService.updateUser(targetUserId, req.body, userId);
      ResponseHandler.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const targetUserId = (req.params as any).id;
      await userService.deleteUser(targetUserId, userId);
      ResponseHandler.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const targetUserId = (req.params as any).id;
      const user = await userService.restoreUser(targetUserId, userId);
      ResponseHandler.success(res, user, 'User restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async resetUserPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const targetUserId = (req.params as any).id;
      const { newPassword } = req.body;
      const result = await userService.resetUserPassword(targetUserId, newPassword, userId);
      ResponseHandler.success(res, result, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
