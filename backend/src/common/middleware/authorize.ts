import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ForbiddenError } from '../errors/AppError';

/**
 * Authorize middleware - checks if user has required permissions
 * @param module - The module name (e.g., 'products', 'sales')
 * @param action - The action (e.g., 'create', 'read', 'update', 'delete')
 */
export const authorize = (module: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const requiredPermission = `${module}.${action}`;
    const hasPermission = req.user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          `You don't have permission to perform this action. Required: ${requiredPermission}`
        )
      );
    }

    next();
  };
};

/**
 * Authorize by role
 */
export const authorizeRole = (...requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const hasRole = requiredRoles.some((role) => req.user!.roles.includes(role));

    if (!hasRole) {
      return next(
        new ForbiddenError(
          `You don't have the required role. Required: ${requiredRoles.join(' or ')}`
        )
      );
    }

    next();
  };
};
