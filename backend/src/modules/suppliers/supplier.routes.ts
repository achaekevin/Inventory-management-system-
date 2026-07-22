import { Router } from 'express';
import supplierController from './supplier.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierIdSchema,
  updateSupplierRatingSchema,
  createSupplierContactSchema,
  updateSupplierContactSchema,
  contactIdSchema,
  supplierIdParamSchema,
} from './supplier.validator';

const router = Router();

router.use(authenticate);

// ==================== SUPPLIER ROUTES ====================

router.get('/', authorize('suppliers', 'read'), supplierController.getSuppliers);

router.get(
  '/:id',
  authorize('suppliers', 'read'),
  validate(supplierIdSchema),
  supplierController.getSupplierById
);

router.post(
  '/',
  authorize('suppliers', 'create'),
  validate(createSupplierSchema),
  supplierController.createSupplier
);

router.put(
  '/:id',
  authorize('suppliers', 'update'),
  validate(supplierIdSchema),
  validate(updateSupplierSchema),
  supplierController.updateSupplier
);

router.put(
  '/:id/rating',
  authorize('suppliers', 'update'),
  validate(supplierIdSchema),
  validate(updateSupplierRatingSchema),
  supplierController.updateSupplierRating
);

router.delete(
  '/:id',
  authorize('suppliers', 'delete'),
  validate(supplierIdSchema),
  supplierController.deleteSupplier
);

router.post(
  '/:id/restore',
  authorize('suppliers', 'delete'),
  validate(supplierIdSchema),
  supplierController.restoreSupplier
);

// ==================== CONTACT ROUTES ====================

router.get(
  '/:supplierId/contacts',
  authorize('suppliers', 'read'),
  validate(supplierIdParamSchema),
  supplierController.getContactsBySupplier
);

router.get(
  '/contacts/:id',
  authorize('suppliers', 'read'),
  validate(contactIdSchema),
  supplierController.getContactById
);

router.post(
  '/contacts',
  authorize('suppliers', 'create'),
  validate(createSupplierContactSchema),
  supplierController.createContact
);

router.put(
  '/contacts/:id',
  authorize('suppliers', 'update'),
  validate(contactIdSchema),
  validate(updateSupplierContactSchema),
  supplierController.updateContact
);

router.delete(
  '/contacts/:id',
  authorize('suppliers', 'delete'),
  validate(contactIdSchema),
  supplierController.deleteContact
);

export default router;
