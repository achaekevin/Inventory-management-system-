import { Router } from 'express';
import userController from './user.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userIdSchema,
} from './user.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('users', 'read'), userController.getUsers);

router.get(
  '/:id',
  authorize('users', 'read'),
  validate(userIdSchema),
  userController.getUserById
);

router.post(
  '/',
  authorize('users', 'create'),
  validate(createUserSchema),
  userController.createUser
);

router.put(
  '/:id',
  authorize('users', 'update'),
  validate(userIdSchema),
  validate(updateUserSchema),
  userController.updateUser
);

router.put(
  '/:id/reset-password',
  authorize('users', 'update'),
  validate(userIdSchema),
  validate(resetPasswordSchema),
  userController.resetUserPassword
);

router.delete(
  '/:id',
  authorize('users', 'delete'),
  validate(userIdSchema),
  userController.deleteUser
);

router.post(
  '/:id/restore',
  authorize('users', 'delete'),
  validate(userIdSchema),
  userController.restoreUser
);

export default router;
