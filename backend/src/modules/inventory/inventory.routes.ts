import { Router } from 'express';
import inventoryController from './inventory.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  stockAdjustmentSchema,
  stockTransferSchema,
  initializeInventorySchema,
  reserveStockSchema,
  releaseStockSchema,
  consumeStockSchema,
  inventoryItemParamsSchema,
  movementIdSchema,
} from './inventory.validator';

const router = Router();

router.use(authenticate);

// ==================== INVENTORY ITEM ROUTES ====================

// Get all inventory items
router.get(
  '/items',
  authorize('inventory', 'read'),
  inventoryController.getInventoryItems
);

// Get specific inventory item
router.get(
  '/items/:productId/:warehouseId',
  authorize('inventory', 'read'),
  validate(inventoryItemParamsSchema),
  inventoryController.getInventoryItem
);

// Initialize inventory item
router.post(
  '/items/initialize',
  authorize('inventory', 'create'),
  validate(initializeInventorySchema),
  inventoryController.initializeInventoryItem
);

// ==================== STOCK ADJUSTMENT ROUTES ====================

// Create stock adjustment (increase/decrease)
router.post(
  '/adjustments',
  authorize('inventory', 'update'),
  validate(stockAdjustmentSchema),
  inventoryController.createStockAdjustment
);

// ==================== STOCK TRANSFER ROUTES ====================

// Transfer stock between warehouses
router.post(
  '/transfers',
  authorize('inventory', 'update'),
  validate(stockTransferSchema),
  inventoryController.transferStock
);

// ==================== STOCK MOVEMENT ROUTES ====================

// Get all stock movements
router.get(
  '/movements',
  authorize('inventory', 'read'),
  inventoryController.getStockMovements
);

// Get stock movement by ID
router.get(
  '/movements/:id',
  authorize('inventory', 'read'),
  validate(movementIdSchema),
  inventoryController.getStockMovementById
);

// ==================== STOCK RESERVATION ROUTES ====================

// Reserve stock
router.post(
  '/reserve',
  authorize('inventory', 'update'),
  validate(reserveStockSchema),
  inventoryController.reserveStock
);

// Release reserved stock
router.post(
  '/release',
  authorize('inventory', 'update'),
  validate(releaseStockSchema),
  inventoryController.releaseReservedStock
);

// Consume reserved stock
router.post(
  '/consume',
  authorize('inventory', 'update'),
  validate(consumeStockSchema),
  inventoryController.consumeReservedStock
);

// ==================== VALUATION ROUTES ====================

// Calculate inventory value
router.get(
  '/valuation',
  authorize('inventory', 'read'),
  inventoryController.calculateInventoryValue
);

export default router;
