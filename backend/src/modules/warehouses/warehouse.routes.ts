import { Router } from 'express';
import warehouseController from './warehouse.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseIdSchema,
  createZoneSchema,
  updateZoneSchema,
  zoneIdSchema,
  warehouseIdParamSchema,
  createBinSchema,
  updateBinSchema,
  binIdSchema,
  zoneIdParamSchema,
} from './warehouse.validator';

const router = Router();

router.use(authenticate);

// ==================== WAREHOUSE ROUTES ====================

router.get('/', authorize('warehouses', 'read'), warehouseController.getWarehouses);

router.get(
  '/:id',
  authorize('warehouses', 'read'),
  validate(warehouseIdSchema),
  warehouseController.getWarehouseById
);

router.get(
  '/:id/capacity',
  authorize('warehouses', 'read'),
  validate(warehouseIdSchema),
  warehouseController.getWarehouseCapacity
);

router.post(
  '/',
  authorize('warehouses', 'create'),
  validate(createWarehouseSchema),
  warehouseController.createWarehouse
);

router.put(
  '/:id',
  authorize('warehouses', 'update'),
  validate(warehouseIdSchema),
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse
);

router.delete(
  '/:id',
  authorize('warehouses', 'delete'),
  validate(warehouseIdSchema),
  warehouseController.deleteWarehouse
);

router.post(
  '/:id/restore',
  authorize('warehouses', 'delete'),
  validate(warehouseIdSchema),
  warehouseController.restoreWarehouse
);

// ==================== ZONE ROUTES ====================

router.get(
  '/:warehouseId/zones',
  authorize('warehouses', 'read'),
  validate(warehouseIdParamSchema),
  warehouseController.getZonesByWarehouse
);

router.get(
  '/zones/:id',
  authorize('warehouses', 'read'),
  validate(zoneIdSchema),
  warehouseController.getZoneById
);

router.post(
  '/zones',
  authorize('warehouses', 'create'),
  validate(createZoneSchema),
  warehouseController.createZone
);

router.put(
  '/zones/:id',
  authorize('warehouses', 'update'),
  validate(zoneIdSchema),
  validate(updateZoneSchema),
  warehouseController.updateZone
);

router.delete(
  '/zones/:id',
  authorize('warehouses', 'delete'),
  validate(zoneIdSchema),
  warehouseController.deleteZone
);

// ==================== BIN ROUTES ====================

router.get(
  '/zones/:zoneId/bins',
  authorize('warehouses', 'read'),
  validate(zoneIdParamSchema),
  warehouseController.getBinsByZone
);

router.get(
  '/bins/:id',
  authorize('warehouses', 'read'),
  validate(binIdSchema),
  warehouseController.getBinById
);

router.post(
  '/bins',
  authorize('warehouses', 'create'),
  validate(createBinSchema),
  warehouseController.createBin
);

router.put(
  '/bins/:id',
  authorize('warehouses', 'update'),
  validate(binIdSchema),
  validate(updateBinSchema),
  warehouseController.updateBin
);

router.delete(
  '/bins/:id',
  authorize('warehouses', 'delete'),
  validate(binIdSchema),
  warehouseController.deleteBin
);

export default router;
