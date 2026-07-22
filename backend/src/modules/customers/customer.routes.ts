import { Router } from 'express';
import customerController from './customer.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
  updateLoyaltyPointsSchema,
  createCustomerAddressSchema,
  updateCustomerAddressSchema,
  addressIdSchema,
  customerIdParamSchema,
} from './customer.validator';

const router = Router();

router.use(authenticate);

// ==================== CUSTOMER ROUTES ====================

router.get('/', authorize('customers', 'read'), customerController.getCustomers);

router.get(
  '/:id',
  authorize('customers', 'read'),
  validate(customerIdSchema),
  customerController.getCustomerById
);

router.get(
  '/:id/purchase-summary',
  authorize('customers', 'read'),
  validate(customerIdSchema),
  customerController.getCustomerPurchaseSummary
);

router.post(
  '/',
  authorize('customers', 'create'),
  validate(createCustomerSchema),
  customerController.createCustomer
);

router.put(
  '/:id',
  authorize('customers', 'update'),
  validate(customerIdSchema),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

router.put(
  '/:id/loyalty-points',
  authorize('customers', 'update'),
  validate(customerIdSchema),
  validate(updateLoyaltyPointsSchema),
  customerController.updateLoyaltyPoints
);

router.delete(
  '/:id',
  authorize('customers', 'delete'),
  validate(customerIdSchema),
  customerController.deleteCustomer
);

router.post(
  '/:id/restore',
  authorize('customers', 'delete'),
  validate(customerIdSchema),
  customerController.restoreCustomer
);

// ==================== ADDRESS ROUTES ====================

router.get(
  '/:customerId/addresses',
  authorize('customers', 'read'),
  validate(customerIdParamSchema),
  customerController.getAddressesByCustomer
);

router.get(
  '/addresses/:id',
  authorize('customers', 'read'),
  validate(addressIdSchema),
  customerController.getAddressById
);

router.post(
  '/addresses',
  authorize('customers', 'create'),
  validate(createCustomerAddressSchema),
  customerController.createAddress
);

router.put(
  '/addresses/:id',
  authorize('customers', 'update'),
  validate(addressIdSchema),
  validate(updateCustomerAddressSchema),
  customerController.updateAddress
);

router.delete(
  '/addresses/:id',
  authorize('customers', 'delete'),
  validate(addressIdSchema),
  customerController.deleteAddress
);

export default router;
