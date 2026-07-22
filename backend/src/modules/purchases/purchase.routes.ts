import { Router } from 'express';
import purchaseController from './purchase.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  receivePurchaseSchema,
  purchaseIdSchema,
} from './purchase.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all purchases (read permission)
router.get(
  '/',
  authorize('purchases', 'read'),
  purchaseController.getPurchases
);

// Get purchase by ID (read permission)
router.get(
  '/:id',
  authorize('purchases', 'read'),
  validate(purchaseIdSchema),
  purchaseController.getPurchaseById
);

// Create purchase (create permission)
router.post(
  '/',
  authorize('purchases', 'create'),
  validate(createPurchaseSchema),
  purchaseController.createPurchase
);

// Update purchase (update permission)
router.put(
  '/:id',
  authorize('purchases', 'update'),
  validate(purchaseIdSchema),
  validate(updatePurchaseSchema),
  purchaseController.updatePurchase
);

// Approve purchase (update permission)
router.post(
  '/:id/approve',
  authorize('purchases', 'update'),
  validate(purchaseIdSchema),
  purchaseController.approvePurchase
);

// Receive purchase (update permission)
router.post(
  '/:id/receive',
  authorize('purchases', 'update'),
  validate(purchaseIdSchema),
  validate(receivePurchaseSchema),
  purchaseController.receivePurchase
);

// Cancel purchase (update permission)
router.post(
  '/:id/cancel',
  authorize('purchases', 'update'),
  validate(purchaseIdSchema),
  purchaseController.cancelPurchase
);

// Delete purchase (delete permission)
router.delete(
  '/:id',
  authorize('purchases', 'delete'),
  validate(purchaseIdSchema),
  purchaseController.deletePurchase
);

export default router;
