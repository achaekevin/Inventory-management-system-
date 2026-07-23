import { Response, NextFunction } from 'express';
import reportService from './report.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';
import { BadRequestError } from '../../common/errors/AppError';

export class ReportController {
  /**
   * Get sales report
   */
  async getSalesReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : new Date();
      const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';

      if (fromDate > toDate) {
        throw new BadRequestError('From date must be before to date');
      }

      const report = await reportService.getSalesReport(fromDate, toDate, groupBy);
      ResponseHandler.success(res, report, 'Sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get purchase report
   */
  async getPurchaseReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : new Date();

      if (fromDate > toDate) {
        throw new BadRequestError('From date must be before to date');
      }

      const report = await reportService.getPurchaseReport(fromDate, toDate);
      ResponseHandler.success(res, report, 'Purchase report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory report
   */
  async getInventoryReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const report = await reportService.getInventoryReport(warehouseId);
      ResponseHandler.success(res, report, 'Inventory report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product performance report
   */
  async getProductPerformanceReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : new Date();
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      if (fromDate > toDate) {
        throw new BadRequestError('From date must be before to date');
      }

      const report = await reportService.getProductPerformanceReport(fromDate, toDate, limit);
      ResponseHandler.success(res, report, 'Product performance report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer report
   */
  async getCustomerReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : new Date();
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      if (fromDate > toDate) {
        throw new BadRequestError('From date must be before to date');
      }

      const report = await reportService.getTopCustomersReport(fromDate, toDate, limit);
      ResponseHandler.success(res, report, 'Customer report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profit and loss report
   */
  async getProfitLossReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : new Date();

      if (fromDate > toDate) {
        throw new BadRequestError('From date must be before to date');
      }

      const report = await reportService.getProfitLossReport(fromDate, toDate);
      ResponseHandler.success(res, report, 'Profit & Loss report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock report
   */
  async getLowStockReport(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportService.getLowStockReport();
      ResponseHandler.success(res, report, 'Low stock report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
