import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreatePurchaseDto {
  supplierId: string;
  orderDate: Date;
  expectedDate?: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }>;
  discount?: number;
  shipping?: number;
  tax?: number;
  notes?: string;
}

export interface UpdatePurchaseDto {
  supplierId?: string;
  orderDate?: Date;
  expectedDate?: Date;
  status?: string;
  discount?: number;
  shipping?: number;
  notes?: string;
}

export interface ReceivePurchaseDto {
  items: Array<{
    purchaseItemId: string;
    receivedQuantity: number;
    warehouseId: string;
  }>;
}

export class PurchaseService {
  /**
   * Get all purchases with pagination and filters
   */
  async getPurchases(filters: PaginationParams & {
    supplierId?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { purchaseNumber: { contains: filters.search } },
        { supplier: { name: { contains: filters.search } } },
      ];
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.orderDate = {};
      if (filters.fromDate) where.orderDate.gte = filters.fromDate;
      if (filters.toDate) where.orderDate.lte = filters.toDate;
    }

    const [purchases, totalCount] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),
      prisma.purchase.count({ where }),
    ]);

    return {
      data: purchases,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get purchase by ID
   */
  async getPurchaseById(id: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!purchase || purchase.deletedAt) {
      throw new NotFoundError('Purchase not found');
    }

    return purchase;
  }

  /**
   * Create new purchase order
   */
  async createPurchase(data: CreatePurchaseDto, userId: string) {
    // Verify supplier exists or resolve fallback
    let supplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          { id: data.supplierId },
          { name: data.supplierId },
        ],
        deletedAt: null,
      },
    });

    if (!supplier) {
      supplier = await prisma.supplier.findFirst({ where: { deletedAt: null } });
    }

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'Main Supplier',
          email: 'supplier@main.local',
          phone: 'N/A',
        },
      });
    }

    // Generate purchase number
    const purchaseNumber = await this.generatePurchaseNumber();

    // Calculate totals
    let subtotal = 0;
    const items = data.items.map((item) => {
      const price = item.unitPrice !== undefined ? item.unitPrice : ((item as any).cost || 0);
      const itemDiscount = item.discount || 0;
      const itemTax = item.tax || 0;
      const itemTotal = (item.quantity * price) - itemDiscount + itemTax;
      subtotal += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
        discount: itemDiscount,
        tax: itemTax,
        total: itemTotal,
      };
    });

    const discount = data.discount || 0;
    const shipping = data.shipping || 0;
    const tax = data.tax !== undefined ? data.tax : (subtotal * 0.1);
    const total = subtotal - discount + shipping + tax;

    // Create purchase with items
    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber,
        supplierId: supplier.id,
        status: 'draft',
        orderDate: data.orderDate || new Date(),
        expectedDate: data.expectedDate,
        subtotal,
        tax,
        discount,
        shipping,
        total,
        notes: data.notes,
        createdBy: userId,
        items: {
          create: items,
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create audit log safely
    this.createAuditLog(userId, 'create', purchase.id, null, purchase).catch((err) => {
      logger.warn(`Audit log failed for purchase ${purchase.id}: ${err.message}`);
    });

    logger.info(`Purchase created: ${purchase.purchaseNumber}`);

    return purchase;
  }

  /**
   * Update purchase
   */
  async updatePurchase(id: string, data: UpdatePurchaseDto, userId: string) {
    const existingPurchase = await this.getPurchaseById(id);

    // Only draft purchases can be updated
    if (existingPurchase.status !== 'draft') {
      throw new BadRequestError('Only draft purchases can be updated');
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        supplierId: data.supplierId,
        orderDate: data.orderDate,
        expectedDate: data.expectedDate,
        status: data.status,
        discount: data.discount,
        shipping: data.shipping,
        notes: data.notes,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', id, existingPurchase, purchase);

    logger.info(`Purchase updated: ${purchase.purchaseNumber}`);

    return purchase;
  }

  /**
   * Approve purchase
   */
  async approvePurchase(id: string, userId: string) {
    const purchase = await this.getPurchaseById(id);

    if (purchase.status !== 'draft') {
      throw new BadRequestError('Only draft purchases can be approved');
    }

    const approvedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'approve', id, purchase, approvedPurchase);

    logger.info(`Purchase approved: ${approvedPurchase.purchaseNumber}`);

    return approvedPurchase;
  }

  /**
   * Receive purchase items
   */
  async receivePurchase(id: string, data: ReceivePurchaseDto, userId: string) {
    const purchase = await this.getPurchaseById(id);

    if (purchase.status !== 'approved' && purchase.status !== 'pending') {
      throw new BadRequestError('Only approved/pending purchases can be received');
    }

    // Use transaction to update inventory and purchase items
    const result = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const purchaseItem = await tx.purchaseItem.findUnique({
          where: { id: item.purchaseItemId },
        });

        if (!purchaseItem) {
          throw new NotFoundError(`Purchase item ${item.purchaseItemId} not found`);
        }

        // Update received quantity
        await tx.purchaseItem.update({
          where: { id: item.purchaseItemId },
          data: {
            received: purchaseItem.received + item.receivedQuantity,
          },
        });

        // Update inventory
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            productId: purchaseItem.productId,
            warehouseId: item.warehouseId,
          },
        });

        if (inventory) {
          await tx.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              quantity: inventory.quantity + item.receivedQuantity,
              available: inventory.available + item.receivedQuantity,
            },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              productId: purchaseItem.productId,
              warehouseId: item.warehouseId,
              quantity: item.receivedQuantity,
              available: item.receivedQuantity,
              reserved: 0,
            },
          });
        }

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: purchaseItem.productId,
            warehouseId: item.warehouseId,
            type: 'IN',
            quantity: item.receivedQuantity,
            reason: 'Purchase received',
            referenceId: id,
            referenceType: 'Purchase',
            createdBy: userId,
          },
        });
      }

      // Check if all items are fully received
      const allItems = await tx.purchaseItem.findMany({
        where: { purchaseId: id },
      });

      const allReceived = allItems.every((item) => item.received >= item.quantity);

      // Update purchase status
      return tx.purchase.update({
        where: { id },
        data: {
          status: allReceived ? 'completed' : 'received',
          receivedDate: new Date(),
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    await this.createAuditLog(userId, 'receive', id, purchase, result);

    logger.info(`Purchase received: ${result.purchaseNumber}`);

    return result;
  }

  /**
   * Delete purchase (soft delete)
   */
  async deletePurchase(id: string, userId: string) {
    const purchase = await this.getPurchaseById(id);

    // Only draft purchases can be deleted
    if (purchase.status !== 'draft') {
      throw new BadRequestError('Only draft purchases can be deleted');
    }

    const deletedPurchase = await prisma.purchase.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', id, purchase, null);

    logger.info(`Purchase deleted: ${purchase.purchaseNumber}`);

    return deletedPurchase;
  }

  /**
   * Cancel purchase
   */
  async cancelPurchase(id: string, userId: string) {
    const purchase = await this.getPurchaseById(id);

    if (purchase.status === 'completed' || purchase.status === 'cancelled') {
      throw new BadRequestError('Cannot cancel completed or already cancelled purchases');
    }

    const cancelledPurchase = await prisma.purchase.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await this.createAuditLog(userId, 'cancel', id, purchase, cancelledPurchase);

    logger.info(`Purchase cancelled: ${cancelledPurchase.purchaseNumber}`);

    return cancelledPurchase;
  }

  /**
   * Generate unique purchase number
   */
  private async generatePurchaseNumber(): Promise<string> {
    const prefix = 'PO';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Get count of purchases this month
    const count = await prisma.purchase.count({
      where: {
        purchaseNumber: {
          startsWith: `${prefix}-${year}${month}`,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}${month}-${sequence}`;
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
        module: 'purchases',
        action,
        entityId,
        entityType: 'Purchase',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new PurchaseService();
