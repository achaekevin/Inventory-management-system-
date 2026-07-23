import { Response, NextFunction } from 'express';
import productService from './product.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class ProductController {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        brandId: req.query.brandId as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        inStock: req.query.inStock === 'true' ? true : undefined,
      };

      const result = await productService.getProducts(filters);
      ResponseHandler.success(res, result.data, 'Products retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = (req.params as any).id;
      const product = await productService.getProductById(productId);
      ResponseHandler.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product
   */
  async createProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const product = await productService.createProduct(req.body, userId);
      ResponseHandler.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   */
  async updateProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = (req.params as any).id;
      const product = await productService.updateProduct(productId, req.body, userId);
      ResponseHandler.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = (req.params as any).id;
      await productService.deleteProduct(productId, userId);
      ResponseHandler.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore deleted product
   */
  async restoreProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = (req.params as any).id;
      const product = await productService.restoreProduct(productId, userId);
      ResponseHandler.success(res, product, 'Product restored successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getLowStockProducts();
      ResponseHandler.success(res, products, 'Low stock products retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product stock summary
   */
  async getProductStockSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = (req.params as any).id;
      const summary = await productService.getProductStockSummary(productId);
      ResponseHandler.success(res, summary, 'Stock summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
