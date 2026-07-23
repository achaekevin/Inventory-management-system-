import { z } from 'zod';

// Stock adjustment validators
export const stockAdjustmentSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    adjustmentType: z.enum(['increase', 'decrease'], {
      message: 'Adjustment type must be increase or decrease',
    }),
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
    reason: z.string().min(3, 'Reason must be at least 3 characters'),
    notes: z.string().optional(),
    costPerUnit: z.number().positive('Cost per unit must be positive').optional(),
  }),
});

// Stock transfer validators
export const stockTransferSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    fromWarehouseId: z.string().uuid('Invalid source warehouse ID'),
    toWarehouseId: z.string().uuid('Invalid destination warehouse ID'),
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
    reason: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// Initialize inventory item
export const initializeInventorySchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
  }),
});

// Stock reservation validators
export const reserveStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
  }),
});

export const releaseStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
  }),
});

export const consumeStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
  }),
});

// Param validators
export const inventoryItemParamsSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
  }),
});

export const movementIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid movement ID'),
  }),
});
