import prisma from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: Array<{ resource: string; action: string }>;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Array<{ resource: string; action: string }>;
  isActive?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class RoleService {
  /**
   * Get all roles with pagination
   */
  async getRoles(filters: PaginationParams & { isActive?: boolean }) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {};

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
              permission: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  module: true,
                },
              },
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
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    return role;
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleDto, userId: string) {
    const existingRole = await prisma.role.findFirst({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new ConflictError('Role name already exists');
    }

    const slug = slugify(data.name);

    const role = await prisma.role.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'create', role.id, null, role);

    logger.info(`Role created: ${role.name}`);

    return role;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleDto, userId: string) {
    const existingRole = await this.getRoleById(id);

    if (data.name && data.name !== existingRole.name) {
      const nameExists = await prisma.role.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictError('Role name already exists');
      }
    }

    const slug = data.name ? slugify(data.name) : undefined;

    const role = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        isActive: data.isActive,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'update', id, existingRole, role);

    logger.info(`Role updated: ${role.name}`);

    return role;
  }

  /**
   * Delete role (deactivate)
   */
  async deleteRole(id: string, userId: string) {
    const role = await this.getRoleById(id);

    const userCount = await prisma.userRole.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new BadRequestError(
        `Cannot delete role assigned to ${userCount} user(s). Please reassign users first.`
      );
    }

    const deactivatedRole = await prisma.role.update({
      where: { id },
      data: { isActive: false },
    });

    await this.createAuditLog(userId, 'delete', id, role, null);

    logger.info(`Role deactivated: ${role.name}`);

    return deactivatedRole;
  }

  /**
   * Restore role (reactivate)
   */
  async restoreRole(id: string, userId: string) {
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.isActive) {
      throw new BadRequestError('Role is already active');
    }

    const restoredRole = await prisma.role.update({
      where: { id },
      data: { isActive: true },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'restore', id, role, restoredRole);

    logger.info(`Role restored: ${restoredRole.name}`);

    return restoredRole;
  }

  /**
   * Get all available permissions
   */
  async getAvailablePermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    });

    return permissions;
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
