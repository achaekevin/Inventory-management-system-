import { Response, NextFunction } from 'express';
import categoryService from './category.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class CategoryController {
  /**
   * Get all categories with pagination and filters
   */
  async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        parentId: req.query.parentId as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await categoryService.getCategories(filters);
      ResponseHandler.success(res, result.data, 'Categories retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category tree
   */
  async getCategoryTree(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await categoryService.getCategoryTree();
      ResponseHandler.success(res, tree, 'Category tree retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = (req.params as any).id;
      const category = await categoryService.getCategoryById(categoryId);
      ResponseHandler.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new category
   */
  async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const category = await categoryService.createCategory(req.body, userId);
      ResponseHandler.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category
   */
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const categoryId = (req.params as any).id;
      const category = await categoryService.updateCategory(categoryId, req.body, userId);
      ResponseHandler.success(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const categoryId = (req.params as any).id;
      await categoryService.deleteCategory(categoryId, userId);
      ResponseHandler.success(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore deleted category
   */
  async restoreCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const categoryId = (req.params as any).id;
      const category = await categoryService.restoreCategory(categoryId, userId);
      ResponseHandler.success(res, category, 'Category restored successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
