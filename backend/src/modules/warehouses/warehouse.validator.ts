import { z } from 'zod';

// Warehouse validators
export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().min(3, 'Zip code must be at least 3 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    capacity: z.number().int().positive('Capacity must be positive').optional(),
    managerId: z.string().uuid('Invalid manager ID').optional(),
  }),
});

export const updateWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    state: z.string().min(2, 'State must be at least 2 characters').optional(),
    zipCode: z.string().min(3, 'Zip code must be at least 3 characters').optional(),
    country: z.string().min(2, 'Country must be at least 2 characters').optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable(),
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
