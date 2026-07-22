import prisma from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: Array<{ resource: string; action: string }>;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Array<{ resource: string; action: string }>;
}

export class RoleService {
  /**
   * Get all roles with pagination
   */
  async getRoles(filters: PaginationParams & { isActive?: boolean }) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [roles, totalCount] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take,
        include: {
          permissions: {
            select: {
              id: true,
              resource: true,
              action: true,
            },
          },
          _count: {
            select: { users: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.role.count({ where }),
    ]);

    return {
      data: roles,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            id: true,
            resource: true,
            action: true,
            description: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundError('Role not found');
    }

    return role;
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleDto, userId: string) {
    // Check if name already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingRole) {
      throw new ConflictError('Role name already exists');
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissions.map((perm) => ({
            resource: perm.resource,
            action: perm.action,
          })),
        },
      },
      include: {
        permissions: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'create', role.id, null, role);

    logger.info(`Role created: ${role.name}`);

    return role;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleDto, userId: string) {
    const existingRole = await this.getRoleById(id);

    // Check name uniqueness if being updated
    if (data.name && data.name !== existingRole.name) {
      const nameExists = await prisma.role.findFirst({
        where: {
          name: data.name,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictError('Role name already exists');
      }
    }

    // Use transaction to update role and permissions
    const role = await prisma.$transaction(async (tx) => {
      // Update role basic info
      const updatedRole = await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      // Update permissions if provided
      if (data.permissions) {
        // Delete existing permissions
        await tx.permission.deleteMany({
          where: { roleId: id },
        });

        // Create new permissions
        await tx.permission.createMany({
          data: data.permissions.map((perm) => ({
            roleId: id,
            resource: perm.resource,
            action: perm.action,
          })),
        });
      }

      // Fetch updated role with permissions
      return tx.role.findUnique({
        where: { id },
        include: {
          permissions: true,
        },
      });
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', id, existingRole, role);

    logger.info(`Role updated: ${role!.name}`);

    return role;
  }

  /**
   * Delete role (soft delete)
   */
  async deleteRole(id: string, userId: string) {
    const role = await this.getRoleById(id);

    // Check if role has users
    const userCount = await prisma.user.count({
      where: {
        roleId: id,
        deletedAt: null,
      },
    });

    if (userCount > 0) {
      throw new BadRequestError(
        `Cannot delete role with ${userCount} user(s). Please reassign users first.`
      );
    }

    const deletedRole = await prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await this.createAuditLog(userId, 'delete', id, role, null);

    logger.info(`Role deleted: ${role.name}`);

    return deletedRole;
  }

  /**
   * Restore deleted role
   */
  async restoreRole(id: string, userId: string) {
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (!role.deletedAt) {
      throw new BadRequestError('Role is not deleted');
    }

    const restoredRole = await prisma.role.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        permissions: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'restore', id, role, restoredRole);

    logger.info(`Role restored: ${restoredRole.name}`);

    return restoredRole;
  }

  /**
   * Get all available permissions (resources and actions)
   */
  async getAvailablePermissions() {
    const resources = [
      'products',
      'categories',
      'brands',
      'units',
      'warehouses',
      'inventory',
      'suppliers',
      'customers',
      'purchases',
      'sales',
      'payments',
      'users',
      'roles',
      'reports',
      'settings',
      'dashboard',
    ];

    const actions = ['create', 'read', 'update', 'delete'];

    return {
      resources,
      actions,
      combinations: resources.flatMap((resource) =>
        actions.map((action) => ({ resource, action }))
      ),
    };
  }

  /**
   * Create audit log
   */
  private async createAuditLog(
    userId: string,
    action: string,
    entityId: string,
    oldValues: any,
    newValues: any
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        module: 'roles',
        action,
        entityId,
        entityType: 'Role',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new RoleService();
