import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
});

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID').optional(),
    saleDate: z.string().transform((val) => new Date(val)),
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
    discount: z.number().min(0).optional(),
    paymentMethod: z.string().optional(),
    paymentStatus: z.enum(['paid', 'pending', 'partial']).optional(),
    notes: z.string().optional(),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
  }),
});

export const updateSaleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    saleDate: z.string().transform((val) => new Date(val)).optional(),
    status: z.enum(['draft', 'completed', 'cancelled']).optional(),
    paymentStatus: z.enum(['paid', 'pending', 'partial']).optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const cancelSaleSchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
  }),
});

export const saleIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sale ID'),
  }),
});
