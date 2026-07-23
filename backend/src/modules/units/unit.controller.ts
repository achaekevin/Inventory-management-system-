import { Response, NextFunction } from 'express';
import unitService from './unit.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class UnitController {
  async getUnits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await unitService.getUnits(filters);
      ResponseHandler.success(res, result.data, 'Units retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getUnitById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const unitId = (req.params as any).id;
      const unit = await unitService.getUnitById(unitId);
      ResponseHandler.success(res, unit, 'Unit retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createUnit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const unit = await unitService.createUnit(req.body, userId);
      ResponseHandler.created(res, unit, 'Unit created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUnit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const unitId = (req.params as any).id;
      const unit = await unitService.updateUnit(unitId, req.body, userId);
      ResponseHandler.success(res, unit, 'Unit updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUnit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const unitId = (req.params as any).id;
      await unitService.deleteUnit(unitId, userId);
      ResponseHandler.success(res, null, 'Unit deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreUnit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const unitId = (req.params as any).id;
      const unit = await unitService.restoreUnit(unitId, userId);
      ResponseHandler.success(res, unit, 'Unit restored successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UnitController();
