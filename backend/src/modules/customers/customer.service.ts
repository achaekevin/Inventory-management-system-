import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateCustomerDto {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  customerType: 'individual' | 'business';
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CreateCustomerAddressDto {
  customerId: string;
  type: 'billing' | 'shipping' | 'both';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateCustomerAddressDto extends Partial<Omit<CreateCustomerAddressDto, 'customerId'>> {}

export interface CustomerFilters extends PaginationParams {
  isActive?: boolean;
  customerType?: 'individual' | 'business';
  city?: string;
  state?: string;
  country?: string;
}

export class CustomerService {
  // ==================== CUSTOMERS ====================

  /**
   * Get all customers with pagination and filters
   */
  async getCustomers(filters: CustomerFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters.city) {
      where.city = { contains: filters.city };
    }

    if (filters.state) {
      where.state = { contains: filters.state };
    }

    if (filters.country) {
      where.country = { contains: filters.country };
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        include: {
          addresses: {
            where: { deletedAt: null, isDefault: true },
            take: 1,
          },
          _count: {
            select: { 
              salesOrders: true,
              addresses: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          where: { deletedAt: null },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' },
          ],
        },
        salesOrders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        _count: {
          select: { 
            salesOrders: true,
            addresses: true,
          },
        },
      },
    });

    if (!customer || customer.deletedAt) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerDto, userId: string) {
    // Check if code already exists
    const existingCode = await prisma.customer.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new BadRequestError('Customer code already exists');
    }

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        code: data.code,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        customerType: data.customerType,
        creditLimit: data.creditLimit,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        loyaltyPoints: 0,
      },
    });

    await this.createAuditLog(userId, 'create', customer.id, 'Customer', null, customer);

    logger.info(`Customer created: ${customer.name} (${customer.code})`);

    return customer;
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, data: UpdateCustomerDto, userId: string) {
    const existingCustomer = await this.getCustomerById(id);

    // Check code uniqueness if being updated
    if (data.code && data.code !== existingCustomer.code) {
      const codeExists = await prisma.customer.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new BadRequestError('Customer code already exists');
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    await this.createAuditLog(userId, 'update', customer.id, 'Customer', existingCustomer, customer);

    logger.info(`Customer updated: ${customer.name} (${customer.code})`);

    return customer;
  }

  /**
   * Delete customer (soft delete)
   */
  async deleteCustomer(id: string, userId: string) {
    const customer = await this.getCustomerById(id);

    // Check if customer has active orders
    const orderCount = await prisma.salesOrder.count({
      where: {
        customerId: id,
        status: { in: ['draft', 'confirmed', 'processing'] },
      },
    });

    if (orderCount > 0) {
      throw new BadRequestError(
        `Cannot delete customer with ${orderCount} active order(s).`
      );
    }

    const deletedCustomer = await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', customer.id, 'Customer', customer, null);

    logger.info(`Customer deleted: ${customer.name} (${customer.code})`);

    return deletedCustomer;
  }

  /**
   * Restore deleted customer
   */
  async restoreCustomer(id: string, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    if (!customer.deletedAt) {
      throw new BadRequestError('Customer is not deleted');
    }

    const restoredCustomer = await prisma.customer.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.createAuditLog(userId, 'restore', customer.id, 'Customer', customer, restoredCustomer);

    logger.info(`Customer restored: ${restoredCustomer.name} (${restoredCustomer.code})`);

    return restoredCustomer;
  }

  /**
   * Update customer loyalty points
   */
  async updateLoyaltyPoints(id: string, points: number, operation: 'add' | 'subtract', userId: string) {
    const customer = await this.getCustomerById(id);

    const newPoints = operation === 'add' 
      ? customer.loyaltyPoints + points 
      : Math.max(0, customer.loyaltyPoints - points);

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: newPoints },
    });

    await this.createAuditLog(
      userId,
      'update_loyalty_points',
      customer.id,
      'Customer',
      { loyaltyPoints: customer.loyaltyPoints },
      { loyaltyPoints: newPoints, operation, points }
    );

    logger.info(`Customer loyalty points updated: ${customer.name} - ${operation} ${points} points`);

    return updatedCustomer;
  }

  /**
   * Get customer purchase summary
   */
  async getCustomerPurchaseSummary(id: string) {
    const customer = await this.getCustomerById(id);

    const orders = await prisma.salesOrder.findMany({
      where: { 
        customerId: id,
        status: 'completed',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get last order date
    const lastOrder = orders.length > 0 
      ? orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
      : null;

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        code: customer.code,
        loyaltyPoints: customer.loyaltyPoints,
      },
      summary: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate: lastOrder?.createdAt || null,
      },
    };
  }

  // ==================== CUSTOMER ADDRESSES ====================

  /**
   * Get addresses by customer
   */
  async getAddressesByCustomer(customerId: string, filters: PaginationParams) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      customerId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { address: { contains: filters.search } },
        { city: { contains: filters.search } },
        { state: { contains: filters.search } },
      ];
    }

    const [addresses, totalCount] = await Promise.all([
      prisma.customerAddress.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.customerAddress.count({ where }),
    ]);

    return {
      data: addresses,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: string) {
    const address = await prisma.customerAddress.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!address || address.deletedAt) {
      throw new NotFoundError('Address not found');
    }

    return address;
  }

  /**
   * Create new address
   */
  async createAddress(data: CreateCustomerAddressDto, userId: string) {
    // Validate customer
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer || customer.deletedAt) {
      throw new BadRequestError('Customer not found');
    }

    // If this is default, unset other default addresses
    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: {
          customerId: data.customerId,
          isDefault: true,
          deletedAt: null,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        customerId: data.customerId,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        isDefault: data.isDefault || false,
      },
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    await this.createAuditLog(userId, 'create', address.id, 'CustomerAddress', null, address);

    logger.info(`Customer address created for ${customer.name}`);

    return address;
  }

  /**
   * Update address
   */
  async updateAddress(id: string, data: UpdateCustomerAddressDto, userId: string) {
    const existingAddress = await this.getAddressById(id);

    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: {
          customerId: existingAddress.customerId,
          isDefault: true,
          deletedAt: null,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.update({
      where: { id },
      data,
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    await this.createAuditLog(userId, 'update', address.id, 'CustomerAddress', existingAddress, address);

    logger.info(`Customer address updated`);

    return address;
  }

  /**
   * Delete address (soft delete)
   */
  async deleteAddress(id: string, userId: string) {
    const address = await this.getAddressById(id);

    const deletedAddress = await prisma.customerAddress.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', address.id, 'CustomerAddress', address, null);

    logger.info(`Customer address deleted`);

    return deletedAddress;
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
        module: 'customers',
        action,
        entityId,
        entityType,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new CustomerService();
