import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateUnitDto {
  name: string;
  shortName: string;
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
          baseUnit: {
            select: { id: true, name: true, shortName: true },
          },
          derivedUnits: {
            where: { deletedAt: null },
            select: { id: true, name: true, shortName: true, conversionFactor: true },
          },
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
        baseUnit: true,
        derivedUnits: {
          where: { deletedAt: null },
        },
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
    // Validate base unit if provided
    if (data.baseUnitId) {
      const baseUnit = await prisma.unit.findUnique({
        where: { id: data.baseUnitId },
      });

      if (!baseUnit || baseUnit.deletedAt) {
        throw new BadRequestError('Base unit not found');
      }

      // Require conversion factor for derived units
      if (!data.conversionFactor || data.conversionFactor <= 0) {
        throw new BadRequestError('Conversion factor must be greater than 0 for derived units');
      }
    }

    const unit = await prisma.unit.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        baseUnitId: data.baseUnitId,
        conversionFactor: data.conversionFactor,
      },
      include: {
        baseUnit: true,
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

    // Validate base unit if being updated
    if (data.baseUnitId) {
      // Prevent setting self as base unit
      if (data.baseUnitId === id) {
        throw new BadRequestError('Unit cannot be its own base unit');
      }

      const baseUnit = await prisma.unit.findUnique({
        where: { id: data.baseUnitId },
      });

      if (!baseUnit || baseUnit.deletedAt) {
        throw new BadRequestError('Base unit not found');
      }

      // Check for circular reference
      const isCircular = await this.hasCircularReference(data.baseUnitId, id);
      if (isCircular) {
        throw new BadRequestError('Cannot set base unit: circular reference detected');
      }

      // Require conversion factor
      if (!data.conversionFactor || data.conversionFactor <= 0) {
        throw new BadRequestError('Conversion factor must be greater than 0 for derived units');
      }
    }

    const unit = await prisma.unit.update({
      where: { id },
      data,
      include: {
        baseUnit: true,
        derivedUnits: {
          where: { deletedAt: null },
        },
      },
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

    // Check if unit has derived units
    const derivedCount = await prisma.unit.count({
      where: {
        baseUnitId: id,
        deletedAt: null,
      },
    });

    if (derivedCount > 0) {
      throw new BadRequestError(
        `Cannot delete unit with ${derivedCount} derived unit(s). Please delete or reassign derived units first.`
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

    // Check if base unit exists (if has base unit)
    if (unit.baseUnitId) {
      const baseUnit = await prisma.unit.findUnique({
        where: { id: unit.baseUnitId },
      });

      if (!baseUnit || baseUnit.deletedAt) {
        throw new BadRequestError('Cannot restore unit: base unit does not exist or is deleted');
      }
    }

    const restoredUnit = await prisma.unit.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        baseUnit: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'restore', unit.id, unit, restoredUnit);

    logger.info(`Unit restored: ${restoredUnit.name} (${restoredUnit.shortName})`);

    return restoredUnit;
  }

  /**
   * Check for circular reference in unit chain
   */
  private async hasCircularReference(baseUnitId: string, unitId: string): Promise<boolean> {
    let currentId: string | null = baseUnitId;
    let iterations = 0;

    while (currentId && iterations < 10) {
      if (currentId === unitId) return true;

      const unit = await prisma.unit.findUnique({
        where: { id: currentId },
        select: { baseUnitId: true },
      });

      if (!unit || !unit.baseUnitId) break;

      currentId = unit.baseUnitId;
      iterations++;
    }

    return false;
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
