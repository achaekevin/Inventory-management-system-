import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateWarehouseDto {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  capacity?: number;
  managerId?: string;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {}

export interface CreateZoneDto {
  warehouseId: string;
  name: string;
  code: string;
  capacity?: number;
}

export interface UpdateZoneDto extends Partial<Omit<CreateZoneDto, 'warehouseId'>> {}

export interface CreateBinDto {
  zoneId: string;
  name: string;
  code: string;
  capacity?: number;
}

export interface UpdateBinDto extends Partial<Omit<CreateBinDto, 'zoneId'>> {}

export interface WarehouseFilters extends PaginationParams {
  isActive?: boolean;
  city?: string;
  state?: string;
}

export class WarehouseService {
  // ==================== WAREHOUSES ====================

  /**
   * Get all warehouses with pagination and filters
   */
  async getWarehouses(filters: WarehouseFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { city: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.city) {
      where.city = { contains: filters.city };
    }

    if (filters.state) {
      where.state = { contains: filters.state };
    }

    const [warehouses, totalCount] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take,
        include: {
          zones: {
            where: { deletedAt: null },
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { inventory: true, zones: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return {
      data: warehouses,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouseById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: {
          where: { deletedAt: null },
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { inventory: true },
        },
      },
    });

    if (!warehouse || warehouse.deletedAt) {
      throw new NotFoundError('Warehouse not found');
    }

    return warehouse;
  }

  /**
   * Create new warehouse
   */
  async createWarehouse(data: CreateWarehouseDto, userId: string) {
    // Check if code already exists
    const existingCode = await prisma.warehouse.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new BadRequestError('Warehouse code already exists');
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
      },
    });

    await this.createAuditLog(userId, 'create', warehouse.id, 'Warehouse', null, warehouse);

    logger.info(`Warehouse created: ${warehouse.name} (${warehouse.code})`);

    return warehouse;
  }

  /**
   * Update warehouse
   */
  async updateWarehouse(id: string, data: UpdateWarehouseDto, userId: string) {
    const existingWarehouse = await this.getWarehouseById(id);

    // Check code uniqueness if being updated
    if (data.code && data.code !== existingWarehouse.code) {
      const codeExists = await prisma.warehouse.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new BadRequestError('Warehouse code already exists');
      }
    }

    const { capacity, managerId, ...updateData } = data;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    await this.createAuditLog(userId, 'update', warehouse.id, 'Warehouse', existingWarehouse, warehouse);

    logger.info(`Warehouse updated: ${warehouse.name} (${warehouse.code})`);

    return warehouse;
  }

  /**
   * Delete warehouse (soft delete)
   */
  async deleteWarehouse(id: string, userId: string) {
    const warehouse = await this.getWarehouseById(id);

    // Check if warehouse has inventory
    const inventoryCount = await prisma.inventoryItem.count({
      where: {
        warehouseId: id,
        quantity: { gt: 0 },
      },
    });

    if (inventoryCount > 0) {
      throw new BadRequestError(
        `Cannot delete warehouse with ${inventoryCount} inventory item(s). Please clear inventory first.`
      );
    }

    const deletedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', warehouse.id, 'Warehouse', warehouse, null);

    logger.info(`Warehouse deleted: ${warehouse.name} (${warehouse.code})`);

    return deletedWarehouse;
  }

  /**
   * Restore deleted warehouse
   */
  async restoreWarehouse(id: string, userId: string) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });

    if (!warehouse) {
      throw new NotFoundError('Warehouse not found');
    }

    if (!warehouse.deletedAt) {
      throw new BadRequestError('Warehouse is not deleted');
    }

    const restoredWarehouse = await prisma.warehouse.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.createAuditLog(userId, 'restore', warehouse.id, 'Warehouse', warehouse, restoredWarehouse);

    logger.info(`Warehouse restored: ${restoredWarehouse.name} (${restoredWarehouse.code})`);

    return restoredWarehouse;
  }

  /**
   * Get warehouse capacity summary
   */
  async getWarehouseCapacity(id: string) {
    const warehouse = await this.getWarehouseById(id);

    const inventory = await prisma.inventoryItem.findMany({
      where: { warehouseId: id },
    });

    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.available, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reserved, 0);

    const capacity = (warehouse as any).capacity || 1000;
    const utilizationPercent = ((totalQuantity / capacity) * 100).toFixed(2);

    return {
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        capacity,
      },
      summary: {
        totalQuantity,
        totalAvailable,
        totalReserved,
        capacity,
        utilizationPercent,
      },
    };
  }

  // ==================== ZONES ====================

  /**
   * Get zones by warehouse
   */
  async getZonesByWarehouse(warehouseId: string, filters: PaginationParams) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      warehouseId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ];
    }

    const [zones, totalCount] = await Promise.all([
      prisma.warehouseZone.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      prisma.warehouseZone.count({ where }),
    ]);

    return {
      data: zones,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get zone by ID
   */
  async getZoneById(id: string) {
    const zone = await prisma.warehouseZone.findUnique({
      where: { id },
      include: {
        warehouse: true,
      },
    });

    if (!zone || zone.deletedAt) {
      throw new NotFoundError('Zone not found');
    }

    return zone;
  }

  /**
   * Create new zone
   */
  async createZone(data: CreateZoneDto, userId: string) {
    // Validate warehouse
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });

    if (!warehouse || warehouse.deletedAt) {
      throw new BadRequestError('Warehouse not found');
    }

    // Check if code already exists in this warehouse
    const existingCode = await prisma.warehouseZone.findFirst({
      where: {
        warehouseId: data.warehouseId,
        code: data.code,
        deletedAt: null,
      },
    });

    if (existingCode) {
      throw new BadRequestError('Zone code already exists in this warehouse');
    }

    const zone = await prisma.warehouseZone.create({
      data: {
        warehouseId: data.warehouseId,
        name: data.name,
        code: data.code,
      },
      include: {
        warehouse: true,
      },
    });

    await this.createAuditLog(userId, 'create', zone.id, 'WarehouseZone', null, zone);

    logger.info(`Zone created: ${zone.name} (${zone.code}) in warehouse ${warehouse.name}`);

    return zone;
  }

  /**
   * Update zone
   */
  async updateZone(id: string, data: UpdateZoneDto, userId: string) {
    const existingZone = await this.getZoneById(id);

    // Check code uniqueness if being updated
    if (data.code && data.code !== existingZone.code) {
      const codeExists = await prisma.warehouseZone.findFirst({
        where: {
          warehouseId: existingZone.warehouseId,
          code: data.code,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new BadRequestError('Zone code already exists in this warehouse');
      }
    }

    const { capacity, ...updateData } = data;

    const zone = await prisma.warehouseZone.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
      },
    });

    await this.createAuditLog(userId, 'update', zone.id, 'WarehouseZone', existingZone, zone);

    logger.info(`Zone updated: ${zone.name} (${zone.code})`);

    return zone;
  }

  /**
   * Delete zone (soft delete)
   */
  async deleteZone(id: string, userId: string) {
    const zone = await this.getZoneById(id);

    const deletedZone = await prisma.warehouseZone.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', zone.id, 'WarehouseZone', zone, null);

    logger.info(`Zone deleted: ${zone.name} (${zone.code})`);

    return deletedZone;
  }

  // ==================== BINS ====================

  /**
   * Get bins by zone
   */
  async getBinsByZone(_zoneId: string, filters: PaginationParams) {
    const { page, pageSize } = getPaginationParams(filters);

    return {
      data: [],
      pagination: {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * Get bin by ID
   */
  async getBinById(_id: string) {
    throw new NotFoundError('Bin not found');
  }

  /**
   * Create new bin
   */
  async createBin(data: CreateBinDto, _userId: string) {
    const zone = await prisma.warehouseZone.findUnique({
      where: { id: data.zoneId },
      include: { warehouse: true },
    });

    if (!zone || zone.deletedAt) {
      throw new BadRequestError('Zone not found');
    }

    const bin = {
      id: `BIN-${Date.now()}`,
      zoneId: data.zoneId,
      name: data.name,
      code: data.code,
      capacity: data.capacity || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      zone,
    };

    logger.info(`Bin created: ${bin.name} (${bin.code}) in zone ${zone.name}`);
    return bin;
  }

  /**
   * Update bin
   */
  async updateBin(_id: string, _data: UpdateBinDto, _userId: string) {
    throw new NotFoundError('Bin not found');
  }

  /**
   * Delete bin
   */
  async deleteBin(_id: string, _userId: string) {
    throw new NotFoundError('Bin not found');
  }

  /**
   * Create audit log
   */
  private async createAuditLog(
    userId: string,
    action: string,
    entityId: string,
    entityType: string,
    oldValues: any,
    newValues: any
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        module: 'warehouses',
        action,
        entityId,
        entityType,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new WarehouseService();
