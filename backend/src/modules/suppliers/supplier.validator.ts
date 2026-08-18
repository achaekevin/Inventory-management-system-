import { z } from 'zod';

// Supplier validators
export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone is required'),
    website: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    creditLimit: z.number().min(0, 'Credit limit must be positive').optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    taxId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    creditLimit: z.number().min(0, 'Credit limit must be positive').optional().nullable(),
    notes: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const supplierIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid supplier ID'),
  }),
});

export const updateSupplierRatingSchema = z.object({
  body: z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  }),
});

// Supplier contact validators
export const createSupplierContactSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('Invalid supplier ID'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    position: z.string().optional(),
    isPrimary: z.boolean().optional(),
  }),
});

export const updateSupplierContactSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    isPrimary: z.boolean().optional(),
  }),
});

export const contactIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
});

export const supplierIdParamSchema = z.object({
  params: z.object({
    supplierId: z.string().uuid('Invalid supplier ID'),
  }),
});
