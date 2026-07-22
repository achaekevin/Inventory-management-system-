import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { slugify, generateUniqueSlug } from '../../common/utilities/slugify';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateBrandDto {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> {}

export interface BrandFilters extends PaginationParams {
  isActive?: boolean;
}

export class BrandService {
  /**
   * Get all brands with pagination and filters
   */
  async getBrands(filters: BrandFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [brands, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.brand.count({ where }),
    ]);

    return {
      data: brands,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string) {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand || brand.deletedAt) {
      throw new NotFoundError('Brand not found');
    }

    return brand;
  }

  /**
   * Create new brand
   */
  async createBrand(data: CreateBrandDto, userId: string) {
    // Generate unique slug
    const baseSlug = slugify(data.name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.brand.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        logo: data.logo,
        website: data.website,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'create', brand.id, null, brand);

    logger.info(`Brand created: ${brand.name}`);

    return brand;
  }

  /**
   * Update brand
   */
  async updateBrand(id: string, data: UpdateBrandDto, userId: string) {
    const existingBrand = await this.getBrandById(id);

    // Generate new slug if name changed
    let slug = existingBrand.slug;
    if (data.name && data.name !== existingBrand.name) {
      const baseSlug = slugify(data.name);
      slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.brand.findUnique({ where: { slug: s } });
        return !!existing && existing.id !== id;
      });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', brand.id, existingBrand, brand);

    logger.info(`Brand updated: ${brand.name}`);

    return brand;
  }

  /**
   * Delete brand (soft delete)
   */
  async deleteBrand(id: string, userId: string) {
    const brand = await this.getBrandById(id);

    // Check if brand has products
    const productCount = await prisma.product.count({
      where: {
        brandId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      throw new BadRequestError(
        `Cannot delete brand with ${productCount} product(s). Please reassign or delete products first.`
      );
    }

    const deletedBrand = await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await this.createAuditLog(userId, 'delete', brand.id, brand, null);

    logger.info(`Brand deleted: ${brand.name}`);

    return deletedBrand;
  }

  /**
   * Restore deleted brand
   */
  async restoreBrand(id: string, userId: string) {
    const brand = await prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    if (!brand.deletedAt) {
      throw new BadRequestError('Brand is not deleted');
    }

    const restoredBrand = await prisma.brand.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Create audit log
    await this.createAuditLog(userId, 'restore', brand.id, brand, restoredBrand);

    logger.info(`Brand restored: ${restoredBrand.name}`);

    return restoredBrand;
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
        module: 'brands',
        action,
        entityId,
        entityType: 'Brand',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new BrandService();
