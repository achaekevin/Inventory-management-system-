import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    website: z.string().url('Invalid website URL').optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().optional().nullable(),
    logo: z.string().url('Invalid logo URL').optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const brandIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid brand ID'),
  }),
});
