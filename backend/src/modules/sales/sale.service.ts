import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateSaleDto {
  customerId?: string;
  saleDate: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }>;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  warehouseId: string;
}

export interface UpdateSaleDto {
  customerId?: string;
  saleDate?: Date;
  status?: string;
  paymentStatus?: string;
  notes?: string;
}

export class SaleService {
  /**
   * Get all sales with pagination and filters
   */
  async getSales(filters: PaginationParams & {
    customerId?: string;
    status?: string;
    paymentStatus?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { saleNumber: { contains: filters.search } },
        { invoiceNumber: { contains: filters.search } },
        { customer: { firstName: { contains: filters.search } } },
        { customer: { lastName: { contains: filters.search } } },
        { customer: { companyName: { contains: filters.search } } },
      ];
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.fromDate || filters.toDate) {
      where.saleDate = {};
      if (filters.fromDate) where.saleDate.gte = filters.fromDate;
      if (filters.toDate) where.saleDate.lte = filters.toDate;
    }

    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
          payments: true,
        },
        orderBy: { saleDate: 'desc' },
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get sale by ID
   */
  async getSaleById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
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
        payments: true,
      },
    });

    if (!sale || sale.deletedAt) {
      throw new NotFoundError('Sale not found');
    }

    return sale;
  }

  /**
   * Create new sale
   */
  async createSale(data: CreateSaleDto, userId: string) {
    // Verify customer exists if provided
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer || customer.deletedAt) {
        throw new NotFoundError('Customer not found');
      }
    }

    // Generate sale number and invoice number
    const saleNumber = await this.generateSaleNumber();
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    let subtotal = 0;
    const items = data.items.map((item) => {
      const itemDiscount = item.discount || 0;
      const itemTax = item.tax || 0;
      const itemTotal = (item.quantity * item.unitPrice) - itemDiscount + itemTax;
      subtotal += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        tax: itemTax,
        total: itemTotal,
      };
    });

    const discount = data.discount || 0;
    const tax = subtotal * 0.1; // 10% tax rate (configurable)
    const total = subtotal - discount + tax;

    // Use transaction to create sale and update inventory
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale with items
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          invoiceNumber,
          customerId: data.customerId,
          status: 'completed',
          saleDate: data.saleDate,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus || 'paid',
          notes: data.notes,
          createdBy: userId,
          items: {
            create: items,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update inventory and create stock movements
      for (const item of data.items) {
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: data.warehouseId,
          },
        });

        if (!inventory) {
          throw new BadRequestError(`Product ${item.productId} not found in warehouse`);
        }

        if (inventory.available < item.quantity) {
          throw new BadRequestError(`Insufficient stock for product ${item.productId}`);
        }

        // Update inventory
        await tx.inventoryItem.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity - item.quantity,
            available: inventory.available - item.quantity,
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId: data.warehouseId,
            type: 'OUT',
            quantity: item.quantity,
            reason: 'Sale',
            referenceId: newSale.id,
            referenceType: 'Sale',
            createdBy: userId,
          },
        });
      }

      // Create payment if paymentMethod is provided
      if (data.paymentMethod && data.paymentStatus === 'paid') {
        await tx.payment.create({
          data: {
            saleId: newSale.id,
            amount: total,
            method: data.paymentMethod,
            status: 'completed',
            createdBy: userId,
          },
        });
      }

      return newSale;
    });

    // Create audit log
    await this.createAuditLog(userId, 'create', sale.id, null, sale);

    logger.info(`Sale created: ${sale.saleNumber}`);

    return sale;
  }

  /**
   * Update sale
   */
  async updateSale(id: string, data: UpdateSaleDto, userId: string) {
    const existingSale = await this.getSaleById(id);

    // Only draft sales can be updated
    if (existingSale.status === 'completed') {
      throw new BadRequestError('Completed sales cannot be updated');
    }

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        customerId: data.customerId,
        saleDate: data.saleDate,
        status: data.status,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', id, existingSale, sale);

    logger.info(`Sale updated: ${sale.saleNumber}`);

    return sale;
  }

  /**
   * Cancel sale
   */
  async cancelSale(id: string, userId: string, warehouseId: string) {
    const sale = await this.getSaleById(id);

    if (sale.status === 'cancelled') {
      throw new BadRequestError('Sale is already cancelled');
    }

    // Use transaction to update sale and restore inventory
    const cancelledSale = await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of sale.items) {
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId,
          },
        });

        if (inventory) {
          await tx.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              quantity: inventory.quantity + item.quantity,
              available: inventory.available + item.quantity,
            },
          });
        }

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId,
            type: 'IN',
            quantity: item.quantity,
            reason: 'Sale cancelled',
            referenceId: id,
            referenceType: 'Sale',
            createdBy: userId,
          },
        });
      }

      // Update sale status
      return tx.sale.update({
        where: { id },
        data: {
          status: 'cancelled',
          paymentStatus: 'cancelled',
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
      });
    });

    await this.createAuditLog(userId, 'cancel', id, sale, cancelledSale);

    logger.info(`Sale cancelled: ${cancelledSale.saleNumber}`);

    return cancelledSale;
  }

  /**
   * Delete sale (soft delete)
   */
  async deleteSale(id: string, userId: string) {
    const sale = await this.getSaleById(id);

    if (sale.status === 'completed') {
      throw new BadRequestError('Completed sales cannot be deleted');
    }

    const deletedSale = await prisma.sale.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', id, sale, null);

    logger.info(`Sale deleted: ${sale.saleNumber}`);

    return deletedSale;
  }

  /**
   * Get sales summary
   */
  async getSalesSummary(fromDate?: Date, toDate?: Date) {
    const where: any = {
      deletedAt: null,
      status: 'completed',
    };

    if (fromDate || toDate) {
      where.saleDate = {};
      if (fromDate) where.saleDate.gte = fromDate;
      if (toDate) where.saleDate.lte = toDate;
    }

    const [totalSales, totalRevenue, salesCount] = await Promise.all([
      prisma.sale.aggregate({
        where,
        _sum: {
          total: true,
        },
      }),
      prisma.sale.aggregate({
        where: { ...where, paymentStatus: 'paid' },
        _sum: {
          total: true,
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      totalSales: totalSales._sum.total || 0,
      totalRevenue: totalRevenue._sum.total || 0,
      salesCount,
      averageOrderValue: salesCount > 0 ? Number(totalSales._sum.total || 0) / salesCount : 0,
    };
  }

  /**
   * Generate unique sale number
   */
  private async generateSaleNumber(): Promise<string> {
    const prefix = 'SO';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await prisma.sale.count({
      where: {
        saleNumber: {
          startsWith: `${prefix}-${year}${month}`,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const prefix = 'INV';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await prisma.sale.count({
      where: {
        invoiceNumber: {
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
        module: 'sales',
        action,
        entityId,
        entityType: 'Sale',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new SaleService();
