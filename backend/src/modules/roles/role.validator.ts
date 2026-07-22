import { z } from 'zod';

const permissionSchema = z.object({
  resource: z.string().min(2, 'Resource name must be at least 2 characters'),
  action: z.enum(['create', 'read', 'update', 'delete'], {
    errorMap: () => ({ message: 'Action must be one of: create, read, update, delete' }),
  }),
});

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    permissions: z.array(permissionSchema).min(1, 'At least one permission is required'),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().optional().nullable(),
    permissions: z.array(permissionSchema).min(1, 'At least one permission is required').optional(),
  }),
});

export const roleIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid role ID'),
  }),
});
