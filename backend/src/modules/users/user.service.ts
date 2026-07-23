import prisma from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import bcrypt from 'bcryptjs';
import logger from '../../config/logger';
import config from '../../config/env';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserFilters extends PaginationParams {
  roleId?: string;
  isActive?: boolean;
}

export class UserService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(filters: UserFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    if (filters.roleId) {
      where.roles = {
        some: {
          roleId: filters.roleId,
        },
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        failedLoginCount: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                permissions: {
                  select: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDto, creatorId: string) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Validate role
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new BadRequestError('Role not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, config.BCRYPT_ROUNDS);

    // Create user with role
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        roles: {
          create: {
            roleId: data.roleId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(creatorId, 'create', user.id, null, user);

    logger.info(`User created: ${user.email}`);

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDto, updaterId: string) {
    const existingUser = await this.getUserById(id);

    // Check email uniqueness if being updated
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
    }

    // Validate role if being updated
    if (data.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new BadRequestError('Role not found');
      }

      // Update role binding
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: data.roleId,
        },
      });
    }

    const { roleId, ...updateFields } = data;

    // Update user fields
    const user = await prisma.user.update({
      where: { id },
      data: updateFields,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(updaterId, 'update', user.id, existingUser, user);

    logger.info(`User updated: ${user.email}`);

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string, deleterId: string) {
    const user = await this.getUserById(id);

    // Prevent self-deletion
    if (id === deleterId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    const deletedUser = await prisma.user.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // Create audit log
    await this.createAuditLog(deleterId, 'delete', user.id, user, null);

    logger.info(`User deleted: ${user.email}`);

    return deletedUser;
  }

  /**
   * Restore deleted user
   */
  async restoreUser(id: string, restorerId: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestError('User is not deleted');
    }

    const restoredUser = await prisma.user.update({
      where: { id },
      data: { 
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(restorerId, 'restore', user.id, user, restoredUser);

    logger.info(`User restored: ${restoredUser.email}`);

    return restoredUser;
  }

  /**
   * Reset user password (admin)
   */
  async resetUserPassword(id: string, newPassword: string, adminId: string) {
    const user = await this.getUserById(id);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    // Create audit log
    await this.createAuditLog(adminId, 'reset_password', user.id, null, { passwordReset: true });

    logger.info(`Password reset for user: ${user.email} by admin`);

    return { message: 'Password reset successfully' };
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
        module: 'users',
        action,
        entityId,
        entityType: 'User',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new UserService();
