import { Router } from 'express';
import saleController from './sale.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createSaleSchema,
  updateSaleSchema,
  cancelSaleSchema,
  saleIdSchema,
} from './sale.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all sales (read permission)
router.get(
  '/',
  authorize('sales', 'read'),
  saleController.getSales
);

// Get sales summary (read permission)
router.get(
  '/summary/overview',
  authorize('sales', 'read'),
  saleController.getSalesSummary
);

// Get sale by ID (read permission)
router.get(
  '/:id',
  authorize('sales', 'read'),
  validate(saleIdSchema),
  saleController.getSaleById
);

// Create sale (create permission)
router.post(
  '/',
  authorize('sales', 'create'),
  validate(createSaleSchema),
  saleController.createSale
);

// Update sale (update permission)
router.put(
  '/:id',
  authorize('sales', 'update'),
  validate(saleIdSchema),
  validate(updateSaleSchema),
  saleController.updateSale
);

// Cancel sale (update permission)
router.post(
  '/:id/cancel',
  authorize('sales', 'update'),
  validate(saleIdSchema),
  validate(cancelSaleSchema),
  saleController.cancelSale
);

// Delete sale (delete permission)
router.delete(
  '/:id',
  authorize('sales', 'delete'),
  validate(saleIdSchema),
  saleController.deleteSale
);

export default router;
