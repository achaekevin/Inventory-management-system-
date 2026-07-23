import { z } from 'zod';

// Customer validators
export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2).max(50).optional(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    customerType: z.enum(['individual', 'business']).optional().default('individual'),
    creditLimit: z.number().min(0).optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code too long').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    customerType: z.enum(['individual', 'business']).optional(),
    creditLimit: z.number().min(0, 'Credit limit must be positive').optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const customerIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID'),
  }),
});

export const updateLoyaltyPointsSchema = z.object({
  body: z.object({
    points: z.number().int('Points must be an integer').positive('Points must be positive'),
    operation: z.enum(['add', 'subtract'], {
      message: 'Operation must be add or subtract',
    }),
  }),
});

// Customer address validators
export const createCustomerAddressSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    type: z.enum(['billing', 'shipping', 'both'], {
      message: 'Type must be billing, shipping, or both',
    }),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().min(3, 'Zip code must be at least 3 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
    isDefault: z.boolean().optional(),
  }),
});

export const updateCustomerAddressSchema = z.object({
  body: z.object({
    type: z.enum(['billing', 'shipping', 'both']).optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    state: z.string().min(2, 'State must be at least 2 characters').optional(),
    zipCode: z.string().min(3, 'Zip code must be at least 3 characters').optional(),
    country: z.string().min(2, 'Country must be at least 2 characters').optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const addressIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid address ID'),
  }),
});

export const customerIdParamSchema = z.object({
  params: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
  }),
});
