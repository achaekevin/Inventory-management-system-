import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { slugify, generateUniqueSlug } from '../../common/utilities/slugify';
import { getPaginationParams, PaginationParams } from '../../common/utilities/pagination';
import logger from '../../config/logger';

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryFilters extends PaginationParams {
  parentId?: string | null;
  isActive?: boolean;
}

export class CategoryService {
  /**
   * Get all categories with pagination and filters
   */
  async getCategories(filters: CategoryFilters) {
    const { skip, take, page, pageSize } = getPaginationParams(filters);

    const where: any = {
      deletedAt: null,
    };

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    // Filter by parent - support null for root categories
    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId === 'null' ? null : filters.parentId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        include: {
          parent: {
            select: { id: true, name: true, slug: true },
          },
          children: {
            where: { deletedAt: null },
            select: { id: true, name: true, slug: true, isActive: true },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree() {
    // Get all active root categories with their descendants
    const rootCategories = await prisma.category.findMany({
      where: {
        deletedAt: null,
        parentId: null,
      },
      include: {
        children: {
          where: { deletedAt: null },
          include: {
            children: {
              where: { deletedAt: null },
              include: {
                children: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rootCategories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryDto, userId: string) {
    // Validate parent category if provided
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.deletedAt) {
        throw new BadRequestError('Parent category not found');
      }

      // Check depth limit (max 4 levels)
      const depth = await this.getCategoryDepth(data.parentId);
      if (depth >= 3) {
        throw new BadRequestError('Maximum category depth (4 levels) exceeded');
      }
    }

    // Generate unique slug
    const baseSlug = slugify(data.name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Create category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId,
      },
      include: {
        parent: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'create', category.id, null, category);

    logger.info(`Category created: ${category.name}`);

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryDto, userId: string) {
    const existingCategory = await this.getCategoryById(id);

    // Prevent setting self as parent
    if (data.parentId && data.parentId === id) {
      throw new BadRequestError('Category cannot be its own parent');
    }

    // Validate parent and check for circular reference
    if (data.parentId) {
      // Check if new parent exists
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.deletedAt) {
        throw new BadRequestError('Parent category not found');
      }

      // Check for circular reference (is the new parent a descendant?)
      const isDescendant = await this.isDescendantOf(data.parentId, id);
      if (isDescendant) {
        throw new BadRequestError('Cannot set a descendant as parent (circular reference)');
      }

      // Check depth limit
      const depth = await this.getCategoryDepth(data.parentId);
      if (depth >= 3) {
        throw new BadRequestError('Maximum category depth (4 levels) exceeded');
      }
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (data.name && data.name !== existingCategory.name) {
      const baseSlug = slugify(data.name);
      slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.category.findUnique({ where: { slug: s } });
        return !!existing && existing.id !== id;
      });
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'update', category.id, existingCategory, category);

    logger.info(`Category updated: ${category.name}`);

    return category;
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id: string, userId: string) {
    const category = await this.getCategoryById(id);

    // Check if category has products
    const productCount = await prisma.product.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      throw new BadRequestError(
        `Cannot delete category with ${productCount} product(s). Please reassign or delete products first.`
      );
    }

    // Check if category has active children
    const activeChildren = await prisma.category.count({
      where: {
        parentId: id,
        deletedAt: null,
      },
    });

    if (activeChildren > 0) {
      throw new BadRequestError(
        `Cannot delete category with ${activeChildren} subcategory(ies). Please delete or reassign subcategories first.`
      );
    }

    // Soft delete
    const deletedCategory = await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await this.createAuditLog(userId, 'delete', category.id, category, null);

    logger.info(`Category deleted: ${category.name}`);

    return deletedCategory;
  }

  /**
   * Restore deleted category
   */
  async restoreCategory(id: string, userId: string) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (!category.deletedAt) {
      throw new BadRequestError('Category is not deleted');
    }

    // Check if parent exists (if has parent)
    if (category.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: category.parentId },
      });

      if (!parent || parent.deletedAt) {
        throw new BadRequestError(
          'Cannot restore category: parent category does not exist or is deleted'
        );
      }
    }

    const restoredCategory = await prisma.category.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        parent: true,
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'restore', category.id, category, restoredCategory);

    logger.info(`Category restored: ${restoredCategory.name}`);

    return restoredCategory;
  }

  /**
   * Get category depth (how many levels deep from root)
   */
  private async getCategoryDepth(categoryId: string): Promise<number> {
    let depth = 0;
    let currentId: string | null = categoryId;

    while (currentId) {
      const currentCat: { parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      if (!currentCat || !currentCat.parentId) break;

      currentId = currentCat.parentId;
      depth++;

      // Safety limit
      if (depth > 10) break;
    }

    return depth;
  }

  /**
   * Check if category is a descendant of another category
   */
  private async isDescendantOf(categoryId: string, ancestorId: string): Promise<boolean> {
    let currentId: string | null = categoryId;
    let iterations = 0;

    while (currentId && iterations < 10) {
      if (currentId === ancestorId) return true;

      const currentCat: { parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      if (!currentCat || !currentCat.parentId) break;

      currentId = currentCat.parentId;
      iterations++;
    }

    return false;
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
        module: 'categories',
        action,
        entityId,
        entityType: 'Category',
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  }
}

export default new CategoryService();
