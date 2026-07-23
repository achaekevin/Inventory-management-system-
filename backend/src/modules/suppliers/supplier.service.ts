import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateSupplierDto {
  name: string;
  code?: string;
  companyName?: string;
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export interface CreateSupplierContactDto {
  supplierId: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface UpdateSupplierContactDto extends Partial<Omit<CreateSupplierContactDto, 'supplierId'>> {}

export interface SupplierFilters extends PaginationParams {
  isActive?: boolean;
  city?: string;
  state?: string;
  country?: string;
}

export class SupplierService {
  // ==================== SUPPLIERS ====================

  /**
   * Get all suppliers with pagination and filters
   */
  async getSuppliers(filters: SupplierFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { companyName: { contains: filters.search } },
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

    if (filters.country) {
      where.country = { contains: filters.country };
    }

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take,
        include: {
          contacts: {
            take: 1,
            orderBy: { isPrimary: 'desc' },
          },
          _count: {
            select: { 
              purchases: true,
              contacts: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { name: 'asc' },
          ],
        },
        purchases: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            purchaseNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        _count: {
          select: { 
            purchases: true,
            contacts: true,
          },
        },
      },
    });

    if (!supplier || supplier.deletedAt) {
      throw new NotFoundError('Supplier not found');
    }

    return supplier;
  }

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateSupplierDto, userId: string) {
    const { code, website, ...createData } = data;

    const supplier = await prisma.supplier.create({
      data: createData,
    });

    await this.createAuditLog(userId, 'create', supplier.id, 'Supplier', null, supplier);

    logger.info(`Supplier created: ${supplier.name}`);

    return supplier;
  }

  /**
   * Update supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierDto, userId: string) {
    const existingSupplier = await this.getSupplierById(id);

    const { code, website, ...updateData } = data;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    await this.createAuditLog(userId, 'update', supplier.id, 'Supplier', existingSupplier, supplier);

    logger.info(`Supplier updated: ${supplier.name}`);

    return supplier;
  }

  /**
   * Delete supplier (soft delete)
   */
  async deleteSupplier(id: string, userId: string) {
    const supplier = await this.getSupplierById(id);

    // Check if supplier has pending purchases
    const poCount = await prisma.purchase.count({
      where: {
        supplierId: id,
        status: { in: ['draft', 'pending', 'approved'] },
      },
    });

    if (poCount > 0) {
      throw new BadRequestError(
        `Cannot delete supplier with ${poCount} active purchase order(s).`
      );
    }

    const deletedSupplier = await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAuditLog(userId, 'delete', supplier.id, 'Supplier', supplier, null);

    logger.info(`Supplier deleted: ${supplier.name}`);

    return deletedSupplier;
  }

  /**
   * Restore deleted supplier
   */
  async restoreSupplier(id: string, userId: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    if (!supplier.deletedAt) {
      throw new BadRequestError('Supplier is not deleted');
    }

    const restoredSupplier = await prisma.supplier.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.createAuditLog(userId, 'restore', supplier.id, 'Supplier', supplier, restoredSupplier);

    logger.info(`Supplier restored: ${restoredSupplier.name}`);

    return restoredSupplier;
  }

  /**
   * Update supplier rating (stub)
   */
  async updateSupplierRating(id: string, rating: number, userId: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }

    const supplier = await this.getSupplierById(id);

    await this.createAuditLog(
      userId,
      'update_rating',
      supplier.id,
      'Supplier',
      null,
      { rating }
    );

    logger.info(`Supplier rating updated: ${supplier.name} - ${rating}/5`);

    return supplier;
  }

  // ==================== SUPPLIER CONTACTS ====================

  /**
   * Get contacts by supplier
   */
  async getContactsBySupplier(supplierId: string, filters: PaginationParams) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      supplierId,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { position: { contains: filters.search } },
      ];
    }

    const [contacts, totalCount] = await Promise.all([
      prisma.supplierContact.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isPrimary: 'desc' },
          { name: 'asc' },
        ],
      }),
      prisma.supplierContact.count({ where }),
    ]);

    return {
      data: contacts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get contact by ID
   */
  async getContactById(id: string) {
    const contact = await prisma.supplierContact.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    return contact;
  }

  /**
   * Create new contact
   */
  async createContact(data: CreateSupplierContactDto, userId: string) {
    // Validate supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier || supplier.deletedAt) {
      throw new BadRequestError('Supplier not found');
    }

    // If this is primary, unset other primary contacts
    if (data.isPrimary) {
      await prisma.supplierContact.updateMany({
        where: {
          supplierId: data.supplierId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.supplierContact.create({
      data: {
        supplierId: data.supplierId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        isPrimary: data.isPrimary || false,
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    await this.createAuditLog(userId, 'create', contact.id, 'SupplierContact', null, contact);

    logger.info(`Supplier contact created: ${contact.name} for ${supplier.name}`);

    return contact;
  }

  /**
   * Update contact
   */
  async updateContact(id: string, data: UpdateSupplierContactDto, userId: string) {
    const existingContact = await this.getContactById(id);

    // If setting as primary, unset other primary contacts
    if (data.isPrimary) {
      await prisma.supplierContact.updateMany({
        where: {
          supplierId: existingContact.supplierId,
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.supplierContact.update({
      where: { id },
      data,
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    await this.createAuditLog(userId, 'update', contact.id, 'SupplierContact', existingContact, contact);

    logger.info(`Supplier contact updated: ${contact.name}`);

    return contact;
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string, userId: string) {
    const contact = await this.getContactById(id);

    const deletedContact = await prisma.supplierContact.delete({
      where: { id },
    });

    await this.createAuditLog(userId, 'delete', contact.id, 'SupplierContact', contact, null);

    logger.info(`Supplier contact deleted: ${contact.name}`);

    return deletedContact;
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
        module: 'suppliers',
        action,
        entityId,
        entityType,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new SupplierService();
