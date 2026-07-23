import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateUnitDto {
  name: string;
  shortName: string;
  description?: string;
  baseUnitId?: string;
  conversionFactor?: number;
}

export interface UpdateUnitDto extends Partial<CreateUnitDto> {}

export interface UnitFilters extends PaginationParams {
  isActive?: boolean;
}

export class UnitService {
  /**
   * Get all units with pagination and filters
   */
  async getUnits(filters: UnitFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { shortName: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [units, totalCount] = await Promise.all([
      prisma.unit.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.unit.count({ where }),
    ]);

    return {
      data: units,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get unit by ID
   */
  async getUnitById(id: string) {
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!unit || unit.deletedAt) {
      throw new NotFoundError('Unit not found');
    }

    return unit;
  }

  /**
   * Create new unit
   */
  async createUnit(data: CreateUnitDto, userId: string) {
    const unit = await prisma.unit.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        description: data.description,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'create', unit.id, null, unit);

    logger.info(`Unit created: ${unit.name} (${unit.shortName})`);

    return unit;
  }

  /**
   * Update unit
   */
  async updateUnit(id: string, data: UpdateUnitDto, userId: string) {
    const existingUnit = await this.getUnitById(id);

    const { baseUnitId, conversionFactor, ...updateData } = data;

    const unit = await prisma.unit.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', unit.id, existingUnit, unit);

    logger.info(`Unit updated: ${unit.name} (${unit.shortName})`);

    return unit;
  }

  /**
   * Delete unit (soft delete)
   */
  async deleteUnit(id: string, userId: string) {
    const unit = await this.getUnitById(id);

    // Check if unit has products
    const productCount = await prisma.product.count({
      where: {
        unitId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      throw new BadRequestError(
        `Cannot delete unit with ${productCount} product(s). Please reassign products first.`
      );
    }

    const deletedUnit = await prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await this.createAuditLog(userId, 'delete', unit.id, unit, null);

    logger.info(`Unit deleted: ${unit.name} (${unit.shortName})`);

    return deletedUnit;
  }

  /**
   * Restore deleted unit
   */
  async restoreUnit(id: string, userId: string) {
    const unit = await prisma.unit.findUnique({ where: { id } });

    if (!unit) {
      throw new NotFoundError('Unit not found');
    }

    if (!unit.deletedAt) {
      throw new BadRequestError('Unit is not deleted');
    }

    const restoredUnit = await prisma.unit.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Create audit log
    await this.createAuditLog(userId, 'restore', unit.id, unit, restoredUnit);

    logger.info(`Unit restored: ${restoredUnit.name} (${restoredUnit.shortName})`);

    return restoredUnit;
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
        module: 'units',
        action,
        entityId,
        entityType: 'Unit',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new UnitService();
