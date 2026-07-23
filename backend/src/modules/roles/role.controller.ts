import { Response, NextFunction } from 'express';
import roleService from './role.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class RoleController {
  /**
   * Get all roles with pagination and filters
   */
  async getRoles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await roleService.getRoles(filters);
      ResponseHandler.success(res, result.data, 'Roles retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roleId = (req.params as any).id;
      const role = await roleService.getRoleById(roleId);
      ResponseHandler.success(res, role, 'Role retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new role
   */
  async createRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = await roleService.createRole(req.body, userId);
      ResponseHandler.created(res, role, 'Role created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update role
   */
  async updateRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const roleId = (req.params as any).id;
      const role = await roleService.updateRole(roleId, req.body, userId);
      ResponseHandler.success(res, role, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete role (soft delete)
   */
  async deleteRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const roleId = (req.params as any).id;
      await roleService.deleteRole(roleId, userId);
      ResponseHandler.success(res, null, 'Role deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore deleted role
   */
  async restoreRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const roleId = (req.params as any).id;
      const role = await roleService.restoreRole(roleId, userId);
      ResponseHandler.success(res, role, 'Role restored successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available permissions
   */
  async getAvailablePermissions(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await roleService.getAvailablePermissions();
      ResponseHandler.success(res, permissions, 'Available permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new RoleController();
