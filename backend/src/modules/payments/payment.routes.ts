import { Router } from 'express';
import paymentController from './payment.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createPaymentSchema,
  updatePaymentSchema,
  paymentIdSchema,
} from './payment.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all payments (read permission)
router.get(
  '/',
  authorize('payments', 'read'),
  paymentController.getPayments
);

// Get payment methods (read permission)
router.get(
  '/methods/list',
  authorize('payments', 'read'),
  paymentController.getPaymentMethods
);

// Get payment summary (read permission)
router.get(
  '/summary/overview',
  authorize('payments', 'read'),
  paymentController.getPaymentSummary
);

// Get payment by ID (read permission)
router.get(
  '/:id',
  authorize('payments', 'read'),
  validate(paymentIdSchema),
  paymentController.getPaymentById
);

// Create payment (create permission)
router.post(
  '/',
  authorize('payments', 'create'),
  validate(createPaymentSchema),
  paymentController.createPayment
);

// Update payment (update permission)
router.put(
  '/:id',
  authorize('payments', 'update'),
  validate(paymentIdSchema),
  validate(updatePaymentSchema),
  paymentController.updatePayment
);

// Void payment (update permission)
router.post(
  '/:id/void',
  authorize('payments', 'update'),
  validate(paymentIdSchema),
  paymentController.voidPayment
);

// Delete payment (delete permission)
router.delete(
  '/:id',
  authorize('payments', 'delete'),
  validate(paymentIdSchema),
  paymentController.deletePayment
);

export default router;
