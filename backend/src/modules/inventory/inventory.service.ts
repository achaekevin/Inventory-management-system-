import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface StockAdjustmentDto {
  productId: string;
  warehouseId: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  notes?: string;
  costPerUnit?: number;
}

export interface StockTransferDto {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface StockMovementFilters extends PaginationParams {
  productId?: string;
  warehouseId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
}

export type CostingMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';

export class InventoryService {
  // ==================== INVENTORY ITEMS ====================

  /**
   * Get inventory items with filters
   */
  async getInventoryItems(filters: PaginationParams & {
    warehouseId?: string;
    productId?: string;
    lowStock?: boolean;
  }) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {};

    if (filters.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.search) {
      where.product = {
        OR: [
          { name: { contains: filters.search } },
          { sku: { contains: filters.search } },
        ],
      };
    }

    const [items, totalCount] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              minStock: true,
              reorderLevel: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    // Filter low stock if requested
    let filteredItems = items;
    if (filters.lowStock) {
      filteredItems = items.filter(
        (item) => item.available <= (item.product.minStock || 0)
      );
    }

    return {
      data: filteredItems,
      pagination: {
        page,
        pageSize,
        totalCount: filters.lowStock ? filteredItems.length : totalCount,
        totalPages: Math.ceil((filters.lowStock ? filteredItems.length : totalCount) / pageSize),
      },
    };
  }

  /**
   * Get inventory item by product and warehouse
   */
  async getInventoryItem(productId: string, warehouseId: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }

    return item;
  }

  /**
   * Initialize inventory item (create if not exists)
   */
  async initializeInventoryItem(productId: string, warehouseId: string) {
    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new BadRequestError('Product not found');
    }

    // Validate warehouse
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse || warehouse.deletedAt) {
      throw new BadRequestError('Warehouse not found');
    }

    // Check if already exists
    const existing = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create new inventory item
    const item = await prisma.inventoryItem.create({
      data: {
        productId,
        warehouseId,
        quantity: 0,
        available: 0,
        reserved: 0,
        costPerUnit: product.cost,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    logger.info(`Inventory item initialized: ${product.name} at ${warehouse.name}`);

    return item;
  }

  // ==================== STOCK ADJUSTMENTS ====================

  /**
   * Create stock adjustment (increase or decrease inventory)
   */
  async createStockAdjustment(data: StockAdjustmentDto, userId: string) {
    // Validate product and warehouse
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.deletedAt) {
      throw new BadRequestError('Product not found');
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });

    if (!warehouse || warehouse.deletedAt) {
      throw new BadRequestError('Warehouse not found');
    }

    // Get or create inventory item
    let inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    if (!inventoryItem) {
      inventoryItem = await this.initializeInventoryItem(data.productId, data.warehouseId);
    }

    // Validate decrease operation
    if (data.adjustmentType === 'decrease') {
      if (inventoryItem.available < data.quantity) {
        throw new BadRequestError(
          `Insufficient stock. Available: ${inventoryItem.available}, Requested: ${data.quantity}`
        );
      }
    }

    // Calculate new quantities
    const quantityChange = data.adjustmentType === 'increase' ? data.quantity : -data.quantity;
    const newQuantity = inventoryItem.quantity + quantityChange;
    const newAvailable = inventoryItem.available + quantityChange;

    // Calculate new cost per unit (weighted average for increases)
    let newCostPerUnit = inventoryItem.costPerUnit;
    if (data.adjustmentType === 'increase' && data.costPerUnit) {
      const totalCost = (inventoryItem.quantity * inventoryItem.costPerUnit) + (data.quantity * data.costPerUnit);
      newCostPerUnit = totalCost / newQuantity;
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory item
      const updatedItem = await tx.inventoryItem.update({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseId,
          },
        },
        data: {
          quantity: newQuantity,
          available: newAvailable,
          costPerUnit: newCostPerUnit,
        },
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          movementType: data.adjustmentType === 'increase' ? 'adjustment_in' : 'adjustment_out',
          quantity: data.quantity,
          costPerUnit: data.costPerUnit || inventoryItem.costPerUnit,
          totalCost: data.quantity * (data.costPerUnit || inventoryItem.costPerUnit),
          reason: data.reason,
          notes: data.notes,
          userId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          module: 'inventory',
          action: 'stock_adjustment',
          entityId: updatedItem.id,
          entityType: 'InventoryItem',
          oldValues: JSON.stringify({
            quantity: inventoryItem.quantity,
            available: inventoryItem.available,
            costPerUnit: inventoryItem.costPerUnit,
          }),
          newValues: JSON.stringify({
            quantity: newQuantity,
            available: newAvailable,
            costPerUnit: newCostPerUnit,
            adjustmentType: data.adjustmentType,
            reason: data.reason,
          }),
        },
      });

      return { updatedItem, movement };
    });

    logger.info(
      `Stock adjustment: ${data.adjustmentType} ${data.quantity} units of ${product.name} at ${warehouse.name}`
    );

    return result;
  }

  // ==================== STOCK TRANSFERS ====================

  /**
   * Transfer stock between warehouses
   */
  async transferStock(data: StockTransferDto, userId: string) {
    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.deletedAt) {
      throw new BadRequestError('Product not found');
    }

    // Validate warehouses
    const [fromWarehouse, toWarehouse] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: data.fromWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: data.toWarehouseId } }),
    ]);

    if (!fromWarehouse || fromWarehouse.deletedAt) {
      throw new BadRequestError('Source warehouse not found');
    }

    if (!toWarehouse || toWarehouse.deletedAt) {
      throw new BadRequestError('Destination warehouse not found');
    }

    if (data.fromWarehouseId === data.toWarehouseId) {
      throw new BadRequestError('Source and destination warehouses cannot be the same');
    }

    // Get source inventory item
    let fromItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.fromWarehouseId,
        },
      },
    });

    if (!fromItem) {
      throw new BadRequestError('Product not found in source warehouse');
    }

    // Check available quantity
    if (fromItem.available < data.quantity) {
      throw new BadRequestError(
        `Insufficient stock in source warehouse. Available: ${fromItem.available}, Requested: ${data.quantity}`
      );
    }

    // Get or create destination inventory item
    let toItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.toWarehouseId,
        },
      },
    });

    if (!toItem) {
      toItem = await this.initializeInventoryItem(data.productId, data.toWarehouseId);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update source inventory (decrease)
      const updatedFromItem = await tx.inventoryItem.update({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.fromWarehouseId,
          },
        },
        data: {
          quantity: { decrement: data.quantity },
          available: { decrement: data.quantity },
        },
      });

      // Update destination inventory (increase)
      const updatedToItem = await tx.inventoryItem.update({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.toWarehouseId,
          },
        },
        data: {
          quantity: { increment: data.quantity },
          available: { increment: data.quantity },
        },
      });

      // Create transfer out movement
      const transferOutMovement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          warehouseId: data.fromWarehouseId,
          movementType: 'transfer_out',
          quantity: data.quantity,
          costPerUnit: fromItem.costPerUnit,
          totalCost: data.quantity * fromItem.costPerUnit,
          reason: data.reason || 'Stock transfer',
          notes: data.notes,
          referenceId: data.toWarehouseId,
          userId,
        },
      });

      // Create transfer in movement
      const transferInMovement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          warehouseId: data.toWarehouseId,
          movementType: 'transfer_in',
          quantity: data.quantity,
          costPerUnit: fromItem.costPerUnit,
          totalCost: data.quantity * fromItem.costPerUnit,
          reason: data.reason || 'Stock transfer',
          notes: data.notes,
          referenceId: data.fromWarehouseId,
          userId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          module: 'inventory',
          action: 'stock_transfer',
          entityId: transferOutMovement.id,
          entityType: 'StockMovement',
          oldValues: null,
          newValues: JSON.stringify({
            productId: data.productId,
            fromWarehouse: fromWarehouse.name,
            toWarehouse: toWarehouse.name,
            quantity: data.quantity,
            reason: data.reason,
          }),
        },
      });

      return {
        updatedFromItem,
        updatedToItem,
        transferOutMovement,
        transferInMovement,
      };
    });

    logger.info(
      `Stock transfer: ${data.quantity} units of ${product.name} from ${fromWarehouse.name} to ${toWarehouse.name}`
    );

    return result;
  }

  // ==================== STOCK MOVEMENTS ====================

  /**
   * Get stock movements with filters
   */
  async getStockMovements(filters: StockMovementFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    if (filters.movementType) {
      where.movementType = filters.movementType;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [movements, totalCount] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get stock movement by ID
   */
  async getStockMovementById(id: string) {
    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!movement) {
      throw new NotFoundError('Stock movement not found');
    }

    return movement;
  }

  // ==================== STOCK RESERVATION ====================

  /**
   * Reserve stock (for orders)
   */
  async reserveStock(productId: string, warehouseId: string, quantity: number, userId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventoryItem) {
      throw new NotFoundError('Inventory item not found');
    }

    if (inventoryItem.available < quantity) {
      throw new BadRequestError(
        `Insufficient available stock. Available: ${inventoryItem.available}, Requested: ${quantity}`
      );
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      data: {
        available: { decrement: quantity },
        reserved: { increment: quantity },
      },
    });

    logger.info(
      `Stock reserved: ${quantity} units of ${inventoryItem.product.name} at ${inventoryItem.warehouse.name}`
    );

    return updatedItem;
  }

  /**
   * Release reserved stock
   */
  async releaseReservedStock(productId: string, warehouseId: string, quantity: number, userId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventoryItem) {
      throw new NotFoundError('Inventory item not found');
    }

    if (inventoryItem.reserved < quantity) {
      throw new BadRequestError(
        `Insufficient reserved stock. Reserved: ${inventoryItem.reserved}, Requested: ${quantity}`
      );
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      data: {
        available: { increment: quantity },
        reserved: { decrement: quantity },
      },
    });

    logger.info(
      `Reserved stock released: ${quantity} units of ${inventoryItem.product.name} at ${inventoryItem.warehouse.name}`
    );

    return updatedItem;
  }

  /**
   * Consume reserved stock (complete order)
   */
  async consumeReservedStock(productId: string, warehouseId: string, quantity: number, userId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventoryItem) {
      throw new NotFoundError('Inventory item not found');
    }

    if (inventoryItem.reserved < quantity) {
      throw new BadRequestError(
        `Insufficient reserved stock. Reserved: ${inventoryItem.reserved}, Requested: ${quantity}`
      );
    }

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory
      const updatedItem = await tx.inventoryItem.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
        data: {
          quantity: { decrement: quantity },
          reserved: { decrement: quantity },
        },
      });

      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          warehouseId,
          movementType: 'sale',
          quantity,
          costPerUnit: inventoryItem.costPerUnit,
          totalCost: quantity * inventoryItem.costPerUnit,
          reason: 'Sale - stock consumed',
          userId,
        },
      });

      return { updatedItem, movement };
    });

    logger.info(
      `Reserved stock consumed: ${quantity} units of ${inventoryItem.product.name} at ${inventoryItem.warehouse.name}`
    );

    return result;
  }

  // ==================== VALUATION METHODS ====================

  /**
   * Calculate inventory value using specified costing method
   */
  async calculateInventoryValue(warehouseId?: string, method: CostingMethod = 'WEIGHTED_AVERAGE') {
    const where: any = {};
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
    });

    let totalValue = 0;

    for (const item of items) {
      let itemValue = 0;

      switch (method) {
        case 'WEIGHTED_AVERAGE':
          itemValue = item.quantity * item.costPerUnit;
          break;

        case 'FIFO':
        case 'LIFO':
          // For FIFO/LIFO, we would need lot tracking which requires stock movement history
          // For now, fall back to weighted average
          itemValue = item.quantity * item.costPerUnit;
          break;
      }

      totalValue += itemValue;
    }

    return {
      totalValue,
      method,
      itemCount: items.length,
      items: items.map((item) => ({
        product: item.product.name,
        sku: item.product.sku,
        warehouse: item.warehouse.name,
        quantity: item.quantity,
        costPerUnit: item.costPerUnit,
        value: item.quantity * item.costPerUnit,
      })),
    };
  }
}

export default new InventoryService();
