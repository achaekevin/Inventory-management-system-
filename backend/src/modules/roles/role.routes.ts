import { Router } from 'express';
import roleController from './role.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema,
} from './role.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all roles (read permission)
router.get(
  '/',
  authorize('roles', 'read'),
  roleController.getRoles
);

// Get available permissions (read permission)
router.get(
  '/permissions/available',
  authorize('roles', 'read'),
  roleController.getAvailablePermissions
);

// Get role by ID (read permission)
router.get(
  '/:id',
  authorize('roles', 'read'),
  validate(roleIdSchema),
  roleController.getRoleById
);

// Create role (create permission)
router.post(
  '/',
  authorize('roles', 'create'),
  validate(createRoleSchema),
  roleController.createRole
);

// Update role (update permission)
router.put(
  '/:id',
  authorize('roles', 'update'),
  validate(roleIdSchema),
  validate(updateRoleSchema),
  roleController.updateRole
);

// Delete role (delete permission)
router.delete(
  '/:id',
  authorize('roles', 'delete'),
  validate(roleIdSchema),
  roleController.deleteRole
);

// Restore role (delete permission - same as delete)
router.post(
  '/:id/restore',
  authorize('roles', 'delete'),
  validate(roleIdSchema),
  roleController.restoreRole
);

export default router;
