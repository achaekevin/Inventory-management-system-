import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ForbiddenError } from '../errors/AppError';

/**
 * Authorize middleware - checks if user has required permissions
 */
export const authorize = (...requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const hasPermission = requiredPermissions.some((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          `You don't have permission to perform this action. Required: ${requiredPermissions.join(' or ')}`
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
