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
          manager: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
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
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        zones: {
          where: { deletedAt: null },
          include: {
            bins: {
              where: { deletedAt: null },
            },
          },
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

    // Validate manager if provided
    if (data.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: data.managerId },
      });

      if (!manager) {
        throw new BadRequestError('Manager not found');
      }
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
        capacity: data.capacity,
        managerId: data.managerId,
      },
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
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

    // Validate manager if being updated
    if (data.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: data.managerId },
      });

      if (!manager) {
        throw new BadRequestError('Manager not found');
      }
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
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
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
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

    const utilizationPercent = warehouse.capacity
      ? ((totalQuantity / warehouse.capacity) * 100).toFixed(2)
      : null;

    return {
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        capacity: warehouse.capacity,
      },
      summary: {
        totalQuantity,
        totalAvailable,
        totalReserved,
        capacity: warehouse.capacity,
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
        include: {
          bins: {
            where: { deletedAt: null },
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { bins: true },
          },
        },
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
        bins: {
          where: { deletedAt: null },
        },
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
        capacity: data.capacity,
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

    const zone = await prisma.warehouseZone.update({
      where: { id },
      data,
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

    // Check if zone has bins
    const binCount = await prisma.warehouseBin.count({
      where: {
        zoneId: id,
        deletedAt: null,
      },
    });

    if (binCount > 0) {
      throw new BadRequestError(
        `Cannot delete zone with ${binCount} bin(s). Please delete bins first.`
      );
    }

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
  async getBinsByZone(zoneId: string, filters: PaginationParams) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      zoneId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ];
    }

    const [bins, totalCount] = await Promise.all([
      prisma.warehouseBin.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      prisma.warehouseBin.count({ where }),
    ]);

    return {
      data: bins,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get bin by ID
   */
  async getBinById(id: string) {
    const bin = await prisma.warehouseBin.findUnique({
      where: { id },
      include: {
        zone: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!bin || bin.deletedAt) {
      throw new NotFoundError('Bin not found');
    }

    return bin;
  }

  /**
   * Create new bin
   */
  async createBin(data: CreateBinDto, userId: string) {
    // Validate zone
    const zone = await prisma.warehouseZone.findUnique({
      where: { id: data.zoneId },
      include: { warehouse: true },
    });

    if (!zone || zone.deletedAt) {
      throw new BadRequestError('Zone not found');
    }

    // Check if code already exists in this zone
    const existingCode = await prisma.warehouseBin.findFirst({
      where: {
        zoneId: data.zoneId,
        code: data.code,
        deletedAt: null,
      },
    });

    if (existingCode) {
      throw new BadRequestError('Bin code already exists in this zone');
    }

    const bin = await prisma.warehouseBin.create({
      data: {
        zoneId: data.zoneId,
        name: data.name,
        code: data.code,
        capacity: data.capacity,
      },
      include: {
        zone: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'create', bin.id, 'WarehouseBin', null, bin);

    logger.info(`Bin created: ${bin.name} (${bin.code}) in zone ${zone.name}`);

    return bin;
  }

  /**
   * Update bin
   */
  async updateBin(id: string, data: UpdateBinDto, userId: string) {
    const existingBin = await this.getBinById(id);

    // Check code uniqueness if being updated
    if (data.code && data.code !== existingBin.code) {
      const codeExists = await prisma.warehouseBin.findFirst({
        where: {
          zoneId: existingBin.zoneId,
          code: data.code,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new BadRequestError('Bin code already exists in this zone');
      }
    }

    const bin = await prisma.warehouseBin.update({
      where: { id },
      data,
      include: {
        zone: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'update', bin.id, 'WarehouseBin', existingBin, bin);

    logger.info(`Bin updated: ${bin.name} (${bin.code})`);

    return bin;
  }

  /**
   * Delete bin (soft delete)
   */
  async deleteBin(id: string, userId: string) {
    const bin = await this.getBinById(id);

    const deletedBin = await prisma.warehouseBin.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', bin.id, 'WarehouseBin', bin, null);

    logger.info(`Bin deleted: ${bin.name} (${bin.code})`);

    return deletedBin;
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
