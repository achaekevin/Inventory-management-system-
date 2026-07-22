import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    parentId: z.string().uuid('Invalid parent category ID').optional(),
    description: z.string().optional(),
    image: z.string().url('Invalid image URL').optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    parentId: z.string().uuid('Invalid parent category ID').optional().nullable(),
    description: z.string().optional().nullable(),
    image: z.string().url('Invalid image URL').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});
