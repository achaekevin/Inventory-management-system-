import { Response, NextFunction } from 'express';
import purchaseService from './purchase.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class PurchaseController {
  /**
   * Get all purchases with pagination and filters
   */
  async getPurchases(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        supplierId: req.query.supplierId as string,
        status: req.query.status as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
      };

      const result = await purchaseService.getPurchases(filters);
      ResponseHandler.success(res, result.data, 'Purchases retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get purchase by ID
   */
  async getPurchaseById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseId = (req.params as any).id;
      const purchase = await purchaseService.getPurchaseById(purchaseId);
      ResponseHandler.success(res, purchase, 'Purchase retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new purchase
   */
  async createPurchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchase = await purchaseService.createPurchase(req.body, userId);
      ResponseHandler.created(res, purchase, 'Purchase created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update purchase
   */
  async updatePurchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchaseId = (req.params as any).id;
      const purchase = await purchaseService.updatePurchase(purchaseId, req.body, userId);
      ResponseHandler.success(res, purchase, 'Purchase updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve purchase
   */
  async approvePurchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchaseId = (req.params as any).id;
      const purchase = await purchaseService.approvePurchase(purchaseId, userId);
      ResponseHandler.success(res, purchase, 'Purchase approved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Receive purchase items
   */
  async receivePurchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchaseId = (req.params as any).id;
      const purchase = await purchaseService.receivePurchase(purchaseId, req.body, userId);
      ResponseHandler.success(res, purchase, 'Purchase received successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel purchase
   */
  async cancelPurchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchaseId = (req.params as any).id;
      const purchase = await purchaseService.cancelPurchase(purchaseId, userId);
      ResponseHandler.success(res, purchase, 'Purchase cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete purchase (soft delete)
   */
  async deletePurchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchaseId = (req.params as any).id;
      await purchaseService.deletePurchase(purchaseId, userId);
      ResponseHandler.success(res, null, 'Purchase deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new PurchaseController();
