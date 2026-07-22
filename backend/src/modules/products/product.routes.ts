import { Router } from 'express';
import productController from './product.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from './product.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all products (read permission)
router.get(
  '/',
  authorize('products', 'read'),
  productController.getProducts
);

// Get low stock products (read permission)
router.get(
  '/low-stock',
  authorize('products', 'read'),
  productController.getLowStockProducts
);

// Get product by ID (read permission)
router.get(
  '/:id',
  authorize('products', 'read'),
  validate(productIdSchema),
  productController.getProductById
);

// Get product stock summary (read permission)
router.get(
  '/:id/stock-summary',
  authorize('products', 'read'),
  validate(productIdSchema),
  productController.getProductStockSummary
);

// Create product (create permission)
router.post(
  '/',
  authorize('products', 'create'),
  validate(createProductSchema),
  productController.createProduct
);

// Update product (update permission)
router.put(
  '/:id',
  authorize('products', 'update'),
  validate(productIdSchema),
  validate(updateProductSchema),
  productController.updateProduct
);

// Delete product (delete permission)
router.delete(
  '/:id',
  authorize('products', 'delete'),
  validate(productIdSchema),
  productController.deleteProduct
);

// Restore product (delete permission - same as delete)
router.post(
  '/:id/restore',
  authorize('products', 'delete'),
  validate(productIdSchema),
  productController.restoreProduct
);

export default router;
