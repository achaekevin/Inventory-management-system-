import prisma from '../../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/AppError';
import { slugify, generateUniqueSlug, generateSKU } from '../../common/utilities/slugify';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateProductDto {
  name: string;
  categoryId: string;
  brandId?: string;
  unitId: string;
  price: number;
  cost: number;
  minStock?: number;
  reorderLevel?: number;
  sku?: string;
  barcode?: string;
  description?: string;
  taxable?: boolean;
  trackInventory?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductFilters extends PaginationParams {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export class ProductService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(filters: ProductFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { sku: { contains: filters.search } },
        { barcode: { contains: filters.search } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    // Get products
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          unit: {
            select: { id: true, name: true, shortName: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          inventory: {
            select: {
              quantity: true,
              available: true,
              warehouse: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
        variants: {
          where: { deletedAt: null },
        },
        inventory: {
          include: {
            warehouse: true,
          },
        },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create new product
   */
  /**
   * Create new product
   */
  async createProduct(data: CreateProductDto, userId: string) {
    // Fail-safe Category lookup or auto-creation
    let category = data.categoryId
      ? await prisma.category.findUnique({ where: { id: data.categoryId } })
      : null;

    if (!category) {
      category = await prisma.category.findFirst({ where: { deletedAt: null } });
    }

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'General',
          slug: 'general',
          description: 'Default category',
        },
      });
    }

    // Fail-safe Unit lookup or auto-creation
    let unit = data.unitId
      ? await prisma.unit.findUnique({ where: { id: data.unitId } })
      : null;

    if (!unit) {
      unit = await prisma.unit.findFirst();
    }

    if (!unit) {
      unit = await prisma.unit.create({
        data: {
          name: 'Piece',
          shortName: 'PCS',
        },
      });
    }

    // Override resolved IDs
    data.categoryId = category.id;
    data.unitId = unit.id;

    // Generate SKU if not provided or collision
    let sku = data.sku || generateSKU('PRD');
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      sku = generateSKU('PRD');
    }

    // Validate brand if provided
    if (data.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brand) {
        data.brandId = undefined;
      }
    }

    // Check if barcode exists
    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingBarcode) {
        throw new ConflictError('Barcode already exists');
      }
    }

    // Generate unique slug
    const baseSlug = slugify(data.name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.product.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        barcode: data.barcode,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId,
        unitId: data.unitId,
        price: data.price,
        cost: data.cost,
        minStock: data.minStock || 0,
        reorderLevel: data.reorderLevel || 0,
        taxable: data.taxable !== undefined ? data.taxable : true,
        trackInventory: data.trackInventory !== undefined ? data.trackInventory : true,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'create', product.id, null, product);

    logger.info(`Product created: ${product.name} (${product.sku})`);

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductDto, userId: string) {
    // Get existing product
    const existingProduct = await this.getProductById(id);

    // Check SKU uniqueness if being updated
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new ConflictError('SKU already exists');
      }
    }

    // Check barcode uniqueness if being updated
    if (data.barcode && data.barcode !== existingProduct.barcode) {
      const barcodeExists = await prisma.product.findUnique({
        where: { barcode: data.barcode },
      });

      if (barcodeExists) {
        throw new ConflictError('Barcode already exists');
      }
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (data.name && data.name !== existingProduct.name) {
      const baseSlug = slugify(data.name);
      slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.product.findUnique({ where: { slug: s } });
        return !!existing && existing.id !== id;
      });
    }

    // Track price change
    if (data.price && Number(data.price) !== Number(existingProduct.price)) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          oldPrice: existingProduct.price,
          newPrice: data.price,
          reason: 'Manual update',
        },
      });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', product.id, existingProduct, product);

    logger.info(`Product updated: ${product.name} (${product.sku})`);

    return product;
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id: string, userId: string) {
    const product = await this.getProductById(id);

    // Check if product has inventory
    const inventory = await prisma.inventoryItem.findFirst({
      where: {
        productId: id,
        quantity: { gt: 0 },
      },
    });

    if (inventory) {
      throw new BadRequestError(
        'Cannot delete product with existing inventory. Please clear inventory first.'
      );
    }

    // Soft delete
    const deletedProduct = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await this.createAuditLog(userId, 'delete', product.id, product, null);

    logger.info(`Product deleted: ${product.name} (${product.sku})`);

    return deletedProduct;
  }

  /**
   * Restore deleted product
   */
  async restoreProduct(id: string, userId: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.deletedAt) {
      throw new BadRequestError('Product is not deleted');
    }

    const restoredProduct = await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'restore', product.id, product, restoredProduct);

    logger.info(`Product restored: ${restoredProduct.name} (${restoredProduct.sku})`);

    return restoredProduct;
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        trackInventory: true,
      },
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Filter products where any warehouse has stock below minimum
    const lowStockProducts = products.filter((product) => {
      return product.inventory.some(
        (inv) => inv.available <= product.minStock
      );
    });

    return lowStockProducts;
  }

  /**
   * Get product stock summary
   */
  async getProductStockSummary(id: string) {
    const product = await this.getProductById(id);

    const inventory = await prisma.inventoryItem.findMany({
      where: { productId: id },
      include: {
        warehouse: true,
      },
    });

    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.available, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reserved, 0);

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        minStock: product.minStock,
        reorderLevel: product.reorderLevel,
      },
      summary: {
        totalQuantity,
        totalAvailable,
        totalReserved,
        isLowStock: totalAvailable <= product.minStock,
        needsReorder: totalAvailable <= product.reorderLevel,
      },
      warehouses: inventory.map((inv) => ({
        warehouse: inv.warehouse,
        quantity: inv.quantity,
        available: inv.available,
        reserved: inv.reserved,
      })),
    };
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
        module: 'products',
        action,
        entityId,
        entityType: 'Product',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new ProductService();
