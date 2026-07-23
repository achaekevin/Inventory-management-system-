import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import logger from '../../config/logger';

export type CreditStatus = 'none' | 'active' | 'suspended' | 'exceeded';

export interface SetCreditLimitDto {
  creditLimit: number;
  notes?: string;
  dueDate?: Date;
}

export interface AdjustBalanceDto {
  amount: number;
  type: 'payment_received' | 'balance_adjusted' | 'sale_on_credit';
  notes?: string;
  referenceId?: string;
  referenceType?: 'sale' | 'payment';
  dueDate?: Date;
}

export class CreditService {
  /**
   * Get full credit profile for a customer
   */
  async getCreditProfile(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        sales: {
          where: { deletedAt: null, paymentStatus: { in: ['pending', 'partial'] } },
          select: {
            id: true,
            saleNumber: true,
            total: true,
            paymentStatus: true,
            saleDate: true,
          },
          orderBy: { saleDate: 'desc' },
        },
        creditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!customer || customer.deletedAt) {
      throw new NotFoundError('Customer not found');
    }

    const creditLimit = parseFloat((customer.creditLimit || 0).toString());
    const outstandingBalance = parseFloat(customer.outstandingBalance.toString());
    const available = Math.max(creditLimit - outstandingBalance, 0);
    const utilization = creditLimit > 0 ? (outstandingBalance / creditLimit) * 100 : 0;

    // Compute overdue invoices (sales older than 30 days with pending payment)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const overdueInvoices = customer.sales.filter(
      (s) => new Date(s.saleDate) < thirtyDaysAgo
    );

    return {
      customer: {
        id: customer.id,
        name: customer.companyName || [customer.firstName, customer.lastName].filter(Boolean).join(' '),
        email: customer.email,
        phone: customer.phone,
        type: customer.type,
        isActive: customer.isActive,
      },
      credit: {
        creditLimit,
        creditStatus: customer.creditStatus as CreditStatus,
        outstandingBalance,
        availableCredit: available,
        utilizationPercent: Math.round(utilization * 10) / 10,
      },
      pendingInvoices: customer.sales,
      overdueInvoices,
      creditLogs: customer.creditLogs,
    };
  }

  /**
   * Get all customers with credit info (for the management list)
   */
  async getCreditSummaryList(filters?: { search?: string; creditStatus?: string }) {
    const where: any = { deletedAt: null };

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { companyName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    if (filters?.creditStatus && filters.creditStatus !== 'all') {
      where.creditStatus = filters.creditStatus;
    }

    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        phone: true,
        type: true,
        creditLimit: true,
        creditStatus: true,
        outstandingBalance: true,
        isActive: true,
        updatedAt: true,
        _count: { select: { creditLogs: true } },
      },
      orderBy: { outstandingBalance: 'desc' },
    });

    return customers.map((c) => {
      const limit = parseFloat((c.creditLimit || 0).toString());
      const balance = parseFloat(c.outstandingBalance.toString());
      return {
        ...c,
        name: c.companyName || [c.firstName, c.lastName].filter(Boolean).join(' '),
        creditLimit: limit,
        outstandingBalance: balance,
        availableCredit: Math.max(limit - balance, 0),
        utilizationPercent: limit > 0 ? Math.round((balance / limit) * 1000) / 10 : 0,
      };
    });
  }

  /**
   * Approve/set a credit limit for a customer
   */
  async approveCreditLimit(customerId: string, data: SetCreditLimitDto, actorId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.deletedAt) throw new NotFoundError('Customer not found');

    const oldLimit = parseFloat((customer.creditLimit || 0).toString());
    const oldBalance = parseFloat(customer.outstandingBalance.toString());
    const newStatus: CreditStatus = data.creditLimit > 0 ? 'active' : 'none';

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: customerId },
        data: {
          creditLimit: data.creditLimit,
          creditStatus: newStatus,
        },
      }),
      prisma.customerCreditLog.create({
        data: {
          customerId,
          type: 'credit_approved',
          amount: data.creditLimit,
          balanceBefore: oldBalance,
          balanceAfter: oldBalance,
          creditLimitBefore: oldLimit,
          creditLimitAfter: data.creditLimit,
          dueDate: data.dueDate,
          notes: data.notes,
          actorId,
        },
      }),
    ]);

    logger.info(`Credit limit set for customer ${customerId}: KSh ${data.creditLimit} by ${actorId}`);
    return this.getCreditProfile(customerId);
  }

  /**
   * Suspend a customer's credit
   */
  async suspendCredit(customerId: string, notes: string, actorId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.deletedAt) throw new NotFoundError('Customer not found');

    const balance = parseFloat(customer.outstandingBalance.toString());
    const limit = parseFloat((customer.creditLimit || 0).toString());

    await prisma.$transaction([
      prisma.customer.update({ where: { id: customerId }, data: { creditStatus: 'suspended' } }),
      prisma.customerCreditLog.create({
        data: {
          customerId,
          type: 'credit_suspended',
          amount: 0,
          balanceBefore: balance,
          balanceAfter: balance,
          creditLimitBefore: limit,
          creditLimitAfter: limit,
          notes,
          actorId,
        },
      }),
    ]);

    logger.info(`Credit suspended for customer ${customerId} by ${actorId}`);
    return this.getCreditProfile(customerId);
  }

  /**
   * Record a payment received against outstanding balance
   */
  async recordPayment(customerId: string, data: AdjustBalanceDto, actorId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.deletedAt) throw new NotFoundError('Customer not found');

    const oldBalance = parseFloat(customer.outstandingBalance.toString());
    const limit = parseFloat((customer.creditLimit || 0).toString());

    if (data.amount <= 0) throw new BadRequestError('Payment amount must be positive');

    const newBalance = Math.max(oldBalance - data.amount, 0);

    // Auto-reactivate if balance is cleared and credit was exceeded/suspended
    let newStatus = customer.creditStatus as CreditStatus;
    if (newBalance <= limit && (newStatus === 'exceeded')) {
      newStatus = 'active';
    }

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: customerId },
        data: { outstandingBalance: newBalance, creditStatus: newStatus },
      }),
      prisma.customerCreditLog.create({
        data: {
          customerId,
          type: 'payment_received',
          amount: data.amount,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          creditLimitBefore: limit,
          creditLimitAfter: limit,
          notes: data.notes,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          actorId,
        },
      }),
    ]);

    logger.info(`Payment of KSh ${data.amount} recorded for customer ${customerId}. Balance: ${oldBalance} → ${newBalance}`);
    return this.getCreditProfile(customerId);
  }

  /**
   * Charge a sale against a customer's credit (called when a sale with credit payment is made)
   */
  async chargeSaleOnCredit(customerId: string, saleId: string, amount: number, dueDate: Date | undefined, actorId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.deletedAt) throw new NotFoundError('Customer not found');

    const oldBalance = parseFloat(customer.outstandingBalance.toString());
    const limit = parseFloat((customer.creditLimit || 0).toString());
    const newBalance = oldBalance + amount;

    if (limit > 0 && newBalance > limit) {
      throw new BadRequestError(`This sale (KSh ${amount}) would exceed the customer's credit limit of KSh ${limit}. Available: KSh ${Math.max(limit - oldBalance, 0)}`);
    }

    const newStatus: CreditStatus = limit > 0 && newBalance >= limit ? 'exceeded' : 'active';

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: customerId },
        data: { outstandingBalance: newBalance, creditStatus: newStatus },
      }),
      prisma.customerCreditLog.create({
        data: {
          customerId,
          type: 'sale_on_credit',
          amount,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          creditLimitBefore: limit,
          creditLimitAfter: limit,
          dueDate,
          notes: `Sale charged to credit`,
          referenceId: saleId,
          referenceType: 'sale',
          actorId,
        },
      }),
    ]);

    logger.info(`Sale of KSh ${amount} charged to credit for customer ${customerId}. Balance: ${oldBalance} → ${newBalance}`);
  }

  /**
   * Manual balance adjustment (admin correction)
   */
  async adjustBalance(customerId: string, data: AdjustBalanceDto, actorId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.deletedAt) throw new NotFoundError('Customer not found');

    const oldBalance = parseFloat(customer.outstandingBalance.toString());
    const limit = parseFloat((customer.creditLimit || 0).toString());
    const newBalance = Math.max(oldBalance + data.amount, 0);

    const newStatus: CreditStatus = limit > 0 && newBalance >= limit ? 'exceeded' : newBalance > 0 ? 'active' : customer.creditStatus as CreditStatus;

    await prisma.$transaction([
      prisma.customer.update({ where: { id: customerId }, data: { outstandingBalance: newBalance, creditStatus: newStatus } }),
      prisma.customerCreditLog.create({
        data: {
          customerId,
          type: 'balance_adjusted',
          amount: data.amount,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          notes: data.notes,
          actorId,
        },
      }),
    ]);

    return this.getCreditProfile(customerId);
  }

  /**
   * Get customers with overdue balances (outstanding > 0 and any sale > 30 days old)
   */
  async getOverdueSummary() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const customers = await prisma.customer.findMany({
      where: {
        deletedAt: null,
        outstandingBalance: { gt: 0 },
        sales: {
          some: {
            saleDate: { lt: thirtyDaysAgo },
            paymentStatus: { in: ['pending', 'partial'] },
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        phone: true,
        creditLimit: true,
        outstandingBalance: true,
        creditStatus: true,
        sales: {
          where: { saleDate: { lt: thirtyDaysAgo }, paymentStatus: { in: ['pending', 'partial'] }, deletedAt: null },
          select: { id: true, saleNumber: true, total: true, saleDate: true },
        },
      },
    });

    return customers.map((c) => ({
      ...c,
      name: c.companyName || [c.firstName, c.lastName].filter(Boolean).join(' '),
      creditLimit: parseFloat((c.creditLimit || 0).toString()),
      outstandingBalance: parseFloat(c.outstandingBalance.toString()),
      daysOverdue: Math.floor((Date.now() - Math.min(...c.sales.map((s) => new Date(s.saleDate).getTime()))) / (24 * 60 * 60 * 1000)),
    }));
  }
}

export default new CreditService();
