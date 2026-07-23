import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateCustomerDto {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  type?: 'individual' | 'business';
  email: string;
  phone: string;
  creditLimit?: number;
  notes?: string;
  // Legacy / input mapping helpers
  name?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  isActive?: boolean;
}

export interface CreateCustomerAddressDto {
  customerId: string;
  type?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
  isPrimary?: boolean;
}

export interface UpdateCustomerAddressDto extends Partial<Omit<CreateCustomerAddressDto, 'customerId'>> {}

export interface CustomerFilters extends PaginationParams {
  isActive?: boolean;
  customerType?: 'individual' | 'business';
  city?: string;
  state?: string;
  country?: string;
}

function getCustomerDisplayName(c: { firstName?: string | null; lastName?: string | null; companyName?: string | null }): string {
  if (c.companyName) return c.companyName;
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  return name || 'Customer';
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
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { companyName: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.customerType) {
      where.type = filters.customerType;
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        include: {
          addresses: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              sales: true,
              addresses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'desc' },
          ],
        },
        sales: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            saleNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            sales: true,
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
    let firstName = data.firstName;
    let lastName = data.lastName;

    if (!firstName && data.name) {
      const parts = data.name.trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || undefined;
    }

    const existingEmail = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new BadRequestError('Customer email already exists');
    }

    const customer = await prisma.customer.create({
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        companyName: data.companyName || null,
        type: data.type || 'individual',
        email: data.email,
        phone: data.phone,
        creditLimit: data.creditLimit ? data.creditLimit : null,
        notes: data.notes || null,
        loyaltyPoints: 0,
      },
    });

    await this.createAuditLog(userId, 'create', customer.id, 'Customer', null, customer);

    logger.info(`Customer created: ${getCustomerDisplayName(customer)}`);

    return customer;
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, data: UpdateCustomerDto, userId: string) {
    const existingCustomer = await this.getCustomerById(id);

    if (data.email && data.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new BadRequestError('Customer email already exists');
      }
    }

    let firstName = data.firstName;
    let lastName = data.lastName;
    if (!firstName && data.name) {
      const parts = data.name.trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || undefined;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName: firstName !== undefined ? firstName : existingCustomer.firstName,
        lastName: lastName !== undefined ? lastName : existingCustomer.lastName,
        companyName: data.companyName !== undefined ? data.companyName : existingCustomer.companyName,
        type: data.type || existingCustomer.type,
        email: data.email || existingCustomer.email,
        phone: data.phone || existingCustomer.phone,
        creditLimit: data.creditLimit !== undefined ? data.creditLimit : existingCustomer.creditLimit,
        notes: data.notes !== undefined ? data.notes : existingCustomer.notes,
        isActive: data.isActive !== undefined ? data.isActive : existingCustomer.isActive,
      },
    });

    await this.createAuditLog(userId, 'update', customer.id, 'Customer', existingCustomer, customer);

    logger.info(`Customer updated: ${getCustomerDisplayName(customer)}`);

    return customer;
  }

  /**
   * Delete customer (soft delete)
   */
  async deleteCustomer(id: string, userId: string) {
    const customer = await this.getCustomerById(id);

    const saleCount = await prisma.sale.count({
      where: {
        customerId: id,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (saleCount > 0) {
      throw new BadRequestError(
        `Cannot delete customer with ${saleCount} active sale(s).`
      );
    }

    const deletedCustomer = await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', customer.id, 'Customer', customer, null);

    logger.info(`Customer deleted: ${getCustomerDisplayName(customer)}`);

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

    logger.info(`Customer restored: ${getCustomerDisplayName(restoredCustomer)}`);

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

    logger.info(`Customer loyalty points updated: ${getCustomerDisplayName(customer)} - ${operation} ${points} points`);

    return updatedCustomer;
  }

  /**
   * Get customer purchase summary
   */
  async getCustomerPurchaseSummary(id: string) {
    const customer = await this.getCustomerById(id);

    const sales = await prisma.sale.findMany({
      where: { 
        customerId: id,
        status: 'completed',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalOrders = sales.length;
    const totalSpent = sales.reduce((sum: number, sale: { total: any }) => sum + Number(sale.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const lastOrder = sales.length > 0 
      ? sales.sort((a: { createdAt: Date }, b: { createdAt: Date }) => b.createdAt.getTime() - a.createdAt.getTime())[0]
      : null;

    return {
      customer: {
        id: customer.id,
        name: getCustomerDisplayName(customer),
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
          { isPrimary: 'desc' },
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
          select: { id: true, firstName: true, lastName: true, companyName: true },
        },
      },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  }

  /**
   * Create new address
   */
  async createAddress(data: CreateCustomerAddressDto, userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer || customer.deletedAt) {
      throw new BadRequestError('Customer not found');
    }

    const isPrimary = data.isPrimary || data.isDefault || false;

    if (isPrimary) {
      await prisma.customerAddress.updateMany({
        where: {
          customerId: data.customerId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        customerId: data.customerId,
        type: data.type || 'billing',
        address: data.address,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        country: data.country || null,
        isPrimary,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, companyName: true },
        },
      },
    });

    await this.createAuditLog(userId, 'create', address.id, 'CustomerAddress', null, address);

    logger.info(`Customer address created for ${getCustomerDisplayName(customer)}`);

    return address;
  }

  /**
   * Update address
   */
  async updateAddress(id: string, data: UpdateCustomerAddressDto, userId: string) {
    const existingAddress = await this.getAddressById(id);

    const isPrimary = data.isPrimary !== undefined ? data.isPrimary : data.isDefault;

    if (isPrimary) {
      await prisma.customerAddress.updateMany({
        where: {
          customerId: existingAddress.customerId,
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.customerAddress.update({
      where: { id },
      data: {
        type: data.type || existingAddress.type,
        address: data.address || existingAddress.address,
        city: data.city !== undefined ? data.city : existingAddress.city,
        state: data.state !== undefined ? data.state : existingAddress.state,
        zipCode: data.zipCode !== undefined ? data.zipCode : existingAddress.zipCode,
        country: data.country !== undefined ? data.country : existingAddress.country,
        isPrimary: isPrimary !== undefined ? isPrimary : existingAddress.isPrimary,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, companyName: true },
        },
      },
    });

    await this.createAuditLog(userId, 'update', address.id, 'CustomerAddress', existingAddress, address);

    logger.info(`Customer address updated`);

    return address;
  }

  /**
   * Delete address
   */
  async deleteAddress(id: string, userId: string) {
    const address = await this.getAddressById(id);

    const deletedAddress = await prisma.customerAddress.delete({
      where: { id },
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
