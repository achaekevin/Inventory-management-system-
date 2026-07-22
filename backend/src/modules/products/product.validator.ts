import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    categoryId: z.string().uuid('Invalid category ID'),
    brandId: z.string().uuid('Invalid brand ID').optional(),
    unitId: z.string().uuid('Invalid unit ID'),
    price: z.number().min(0, 'Price must be positive'),
    cost: z.number().min(0, 'Cost must be positive'),
    minStock: z.number().int().min(0).optional(),
    reorderLevel: z.number().int().min(0).optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    description: z.string().optional(),
    taxable: z.boolean().optional(),
    trackInventory: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    brandId: z.string().uuid('Invalid brand ID').optional().nullable(),
    unitId: z.string().uuid('Invalid unit ID').optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    cost: z.number().min(0, 'Cost must be positive').optional(),
    minStock: z.number().int().min(0).optional(),
    reorderLevel: z.number().int().min(0).optional(),
    sku: z.string().optional(),
    barcode: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    taxable: z.boolean().optional(),
    trackInventory: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});
