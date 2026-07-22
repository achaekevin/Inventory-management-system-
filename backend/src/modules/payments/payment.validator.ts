import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    saleId: z.string().uuid('Invalid sale ID').optional(),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    method: z.string().min(2, 'Payment method is required'),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0').optional(),
    method: z.string().min(2, 'Payment method is required').optional(),
    reference: z.string().optional().nullable(),
    status: z.enum(['completed', 'pending', 'failed']).optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
});
