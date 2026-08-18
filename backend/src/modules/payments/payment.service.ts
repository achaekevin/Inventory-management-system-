import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreatePaymentDto {
  saleId?: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  method?: string;
  reference?: string;
  status?: string;
  notes?: string;
}

export class PaymentService {
  /**
   * Get all payments with pagination and filters
   */
  async getPayments(filters: PaginationParams & {
    saleId?: string;
    method?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { reference: { contains: filters.search } },
        { sale: { saleNumber: { contains: filters.search } } },
        { sale: { invoiceNumber: { contains: filters.search } } },
      ];
    }

    if (filters.saleId) {
      where.saleId = filters.saleId;
    }

    if (filters.method) {
      where.method = filters.method;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          sale: {
            select: {
              id: true,
              saleNumber: true,
              invoiceNumber: true,
              total: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        sale: {
          include: {
            customer: true,
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
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * Create new payment
   */
  async createPayment(data: CreatePaymentDto, userId: string) {
    // Verify sale exists if provided
    if (data.saleId) {
      const sale = await prisma.sale.findUnique({
        where: { id: data.saleId },
        include: {
          payments: true,
        },
      });

      if (!sale || sale.deletedAt) {
        throw new NotFoundError('Sale not found');
      }

      // Check if sale is already fully paid
      const totalPaid = sale.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remainingAmount = Number(sale.total) - totalPaid;

      if (remainingAmount <= 0) {
        throw new BadRequestError('Sale is already fully paid');
      }

      if (data.amount > remainingAmount) {
        throw new BadRequestError(`Payment amount exceeds remaining balance of ${remainingAmount}`);
      }
    }

    // Use transaction to create payment and update sale payment status
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          saleId: data.saleId,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          status: 'completed',
          notes: data.notes,
          createdBy: userId,
        },
        include: {
          sale: true,
        },
      });

      // Update sale payment status if payment is for a sale
      if (data.saleId) {
        const sale = await tx.sale.findUnique({
          where: { id: data.saleId },
          include: { payments: true },
        });

        if (sale) {
          const totalPaid = sale.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(data.amount);
          const saleTotal = Number(sale.total);

          let paymentStatus = 'pending';
          if (totalPaid >= saleTotal) {
            paymentStatus = 'paid';
          } else if (totalPaid > 0) {
            paymentStatus = 'partial';
          }

          await tx.sale.update({
            where: { id: data.saleId },
            data: { paymentStatus },
          });
        }
      }

      return newPayment;
    });

    // Create audit log safely
    this.createAuditLog(userId, 'create', payment.id, null, payment).catch((err) => {
      logger.warn(`Audit log failed for payment ${payment.id}: ${err.message}`);
    });

    logger.info(`Payment created: ${payment.id} - ${payment.method}`);

    return payment;
  }

  /**
   * Update payment
   */
  async updatePayment(id: string, data: UpdatePaymentDto, userId: string) {
    const existingPayment = await this.getPaymentById(id);

    // Only pending or failed payments can be updated
    if (existingPayment.status === 'completed') {
      throw new BadRequestError('Completed payments cannot be updated');
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        status: data.status,
        notes: data.notes,
      },
      include: {
        sale: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', id, existingPayment, payment);

    logger.info(`Payment updated: ${payment.id}`);

    return payment;
  }

  /**
   * Delete payment
   */
  async deletePayment(id: string, userId: string) {
    const payment = await this.getPaymentById(id);

    // Only pending or failed payments can be deleted
    if (payment.status === 'completed') {
      throw new BadRequestError('Completed payments cannot be deleted');
    }

    await prisma.payment.delete({
      where: { id },
    });

    // Create audit log
    await this.createAuditLog(userId, 'delete', id, payment, null);

    logger.info(`Payment deleted: ${payment.id}`);

    return payment;
  }

  /**
   * Void/cancel payment
   */
  async voidPayment(id: string, userId: string) {
    const payment = await this.getPaymentById(id);

    if (payment.status === 'failed') {
      throw new BadRequestError('Cannot void a failed payment');
    }

    // Use transaction to void payment and update sale payment status
    const voidedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: { status: 'failed' },
        include: { sale: true },
      });

      // Recalculate sale payment status if payment was for a sale
      if (payment.saleId) {
        const sale = await tx.sale.findUnique({
          where: { id: payment.saleId },
          include: { payments: true },
        });

        if (sale) {
          const totalPaid = sale.payments
            .filter((p) => p.status === 'completed' && p.id !== id)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const saleTotal = Number(sale.total);

          let paymentStatus = 'pending';
          if (totalPaid >= saleTotal) {
            paymentStatus = 'paid';
          } else if (totalPaid > 0) {
            paymentStatus = 'partial';
          }

          await tx.sale.update({
            where: { id: payment.saleId },
            data: { paymentStatus },
          });
        }
      }

      return updated;
    });

    // Create audit log
    await this.createAuditLog(userId, 'void', id, payment, voidedPayment);

    logger.info(`Payment voided: ${voidedPayment.id}`);

    return voidedPayment;
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary(fromDate?: Date, toDate?: Date) {
    const where: any = {
      status: 'completed',
    };

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const [totalPayments, paymentsByMethod, paymentsCount] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      totalAmount: totalPayments._sum.amount || 0,
      paymentsCount,
      averagePayment: paymentsCount > 0 ? Number(totalPayments._sum.amount || 0) / paymentsCount : 0,
      byMethod: paymentsByMethod.map((m) => ({
        method: m.method,
        totalAmount: m._sum.amount || 0,
        count: m._count,
      })),
    };
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    const methods = [
      { value: 'cash', label: 'Cash' },
      { value: 'card', label: 'Credit/Debit Card' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'check', label: 'Check' },
      { value: 'other', label: 'Other' },
    ];

    return methods;
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
        module: 'payments',
        action,
        entityId,
        entityType: 'Payment',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new PaymentService();
