import { z } from 'zod';

export const createUnitSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    shortName: z.string().min(1, 'Short name is required').max(10, 'Short name too long'),
    baseUnitId: z.string().uuid('Invalid base unit ID').optional(),
    conversionFactor: z.number().positive('Conversion factor must be positive').optional(),
  }),
});

export const updateUnitSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    shortName: z.string().min(1, 'Short name is required').max(10, 'Short name too long').optional(),
    baseUnitId: z.string().uuid('Invalid base unit ID').optional().nullable(),
    conversionFactor: z.number().positive('Conversion factor must be positive').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const unitIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid unit ID'),
  }),
});
