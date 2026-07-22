import { Router } from 'express';
import categoryController from './category.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from './category.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all categories (read permission)
router.get(
  '/',
  authorize('categories', 'read'),
  categoryController.getCategories
);

// Get category tree (read permission)
router.get(
  '/tree',
  authorize('categories', 'read'),
  categoryController.getCategoryTree
);

// Get category by ID (read permission)
router.get(
  '/:id',
  authorize('categories', 'read'),
  validate(categoryIdSchema),
  categoryController.getCategoryById
);

// Create category (create permission)
router.post(
  '/',
  authorize('categories', 'create'),
  validate(createCategorySchema),
  categoryController.createCategory
);

// Update category (update permission)
router.put(
  '/:id',
  authorize('categories', 'update'),
  validate(categoryIdSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

// Delete category (delete permission)
router.delete(
  '/:id',
  authorize('categories', 'delete'),
  validate(categoryIdSchema),
  categoryController.deleteCategory
);

// Restore category (delete permission)
router.post(
  '/:id/restore',
  authorize('categories', 'delete'),
  validate(categoryIdSchema),
  categoryController.restoreCategory
);

export default router;
