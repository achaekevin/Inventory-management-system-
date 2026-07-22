import { Response, NextFunction } from 'express';
import saleService from './sale.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class SaleController {
  /**
   * Get all sales with pagination and filters
   */
  async getSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        customerId: req.query.customerId as string,
        status: req.query.status as string,
        paymentStatus: req.query.paymentStatus as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
      };

      const result = await saleService.getSales(filters);
      ResponseHandler.success(res, result.data, 'Sales retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sale by ID
   */
  async getSaleById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await saleService.getSaleById(req.params.id);
      ResponseHandler.success(res, sale, 'Sale retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new sale
   */
  async createSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sale = await saleService.createSale(req.body, userId);
      ResponseHandler.created(res, sale, 'Sale created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update sale
   */
  async updateSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sale = await saleService.updateSale(req.params.id, req.body, userId);
      ResponseHandler.success(res, sale, 'Sale updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel sale
   */
  async cancelSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { warehouseId } = req.body;
      const sale = await saleService.cancelSale(req.params.id, userId, warehouseId);
      ResponseHandler.success(res, sale, 'Sale cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete sale (soft delete)
   */
  async deleteSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await saleService.deleteSale(req.params.id, userId);
      ResponseHandler.success(res, null, 'Sale deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales summary
   */
  async getSalesSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : undefined;
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : undefined;
      const summary = await saleService.getSalesSummary(fromDate, toDate);
      ResponseHandler.success(res, summary, 'Sales summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new SaleController();
