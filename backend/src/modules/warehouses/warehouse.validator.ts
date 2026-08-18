import { z } from 'zod';

// Warehouse validators
export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(1, 'Code must be at least 1 character').max(20, 'Code too long'),
    description: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
    managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
  }),
});

export const updateWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    code: z.string().min(1, 'Code must be at least 1 character').max(20, 'Code too long').optional(),
    description: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
    managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const warehouseIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID'),
  }),
});

// Zone validators
export const createZoneSchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long'),
    capacity: z.number().int().positive('Capacity must be positive').optional(),
  }),
});

export const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long').optional(),
    capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const zoneIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid zone ID'),
  }),
});

export const warehouseIdParamSchema = z.object({
  params: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
  }),
});

// Bin validators
export const createBinSchema = z.object({
  body: z.object({
    zoneId: z.string().uuid('Invalid zone ID'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long'),
    capacity: z.number().int().positive('Capacity must be positive').optional(),
  }),
});

export const updateBinSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long').optional(),
    capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const binIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bin ID'),
  }),
});

export const zoneIdParamSchema = z.object({
  params: z.object({
    zoneId: z.string().uuid('Invalid zone ID'),
  }),
});
