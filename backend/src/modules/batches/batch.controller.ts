import { Response, NextFunction } from 'express';
import batchService from './batch.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class BatchController {
  /**
   * GET /api/batches
   */
  async getBatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        productId: req.query.productId as string,
        supplierId: req.query.supplierId as string,
        status: req.query.status as string,
        expiringDays: req.query.expiringDays ? Number(req.query.expiringDays) : undefined,
        search: req.query.search as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await batchService.getBatches(filters);
      ResponseHandler.success(
        res,
        result.batches,
        'Batches retrieved successfully',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/batches
   */
  async createBatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const batch = await batchService.createBatch(req.body, userId);
      ResponseHandler.created(res, batch, 'Product batch created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/batches/movements
   */
  async recordMovement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const movement = await batchService.recordMovement(req.body, userId);
      ResponseHandler.created(res, movement, 'Batch movement recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/batches/recall
   */
  async initiateRecall(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const recall = await batchService.initiateRecall(req.body, userId);
      ResponseHandler.created(res, recall, 'Batch recall initiated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/batches/recalls
   */
  async getRecalls(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const recalls = await batchService.getRecalls();
      ResponseHandler.success(res, recalls, 'Batch recalls retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new BatchController();
