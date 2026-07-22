import { z } from 'zod';

const purchaseItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('Invalid supplier ID'),
    orderDate: z.string().transform((val) => new Date(val)),
    expectedDate: z.string().transform((val) => new Date(val)).optional(),
    items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
    discount: z.number().min(0).optional(),
    shipping: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
});

export const updatePurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('Invalid supplier ID').optional(),
    orderDate: z.string().transform((val) => new Date(val)).optional(),
    expectedDate: z.string().transform((val) => new Date(val)).optional().nullable(),
    status: z.enum(['draft', 'pending', 'approved', 'received', 'completed', 'cancelled']).optional(),
    discount: z.number().min(0).optional(),
    shipping: z.number().min(0).optional(),
    notes: z.string().optional().nullable(),
  }),
});

const receiveItemSchema = z.object({
  purchaseItemId: z.string().uuid('Invalid purchase item ID'),
  receivedQuantity: z.number().int().min(1, 'Received quantity must be at least 1'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
});

export const receivePurchaseSchema = z.object({
  body: z.object({
    items: z.array(receiveItemSchema).min(1, 'At least one item is required'),
  }),
});

export const purchaseIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid purchase ID'),
  }),
});
