import { Response, NextFunction } from 'express';
import brandService from './brand.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class BrandController {
  async getBrands(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await brandService.getBrands(filters);
      ResponseHandler.success(res, result.data, 'Brands retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getBrandById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await brandService.getBrandById(req.params.id);
      ResponseHandler.success(res, brand, 'Brand retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createBrand(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const brand = await brandService.createBrand(req.body, userId);
      ResponseHandler.created(res, brand, 'Brand created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateBrand(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const brand = await brandService.updateBrand(req.params.id, req.body, userId);
      ResponseHandler.success(res, brand, 'Brand updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBrand(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await brandService.deleteBrand(req.params.id, userId);
      ResponseHandler.success(res, null, 'Brand deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreBrand(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const brand = await brandService.restoreBrand(req.params.id, userId);
      ResponseHandler.success(res, brand, 'Brand restored successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new BrandController();
