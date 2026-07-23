import { Response, NextFunction } from 'express';
import reorderService from './reorder.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class ReorderController {
  /**
   * GET /api/reorder/scan
   * Detect low stock items and return reorder suggestions
   */
  async scanLowStock(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const suggestions = await reorderService.detectLowStock();
      ResponseHandler.success(res, suggestions, `Found ${suggestions.length} products needing reorder`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reorder/scan-and-notify
   * Full scan + send notifications to managers
   */
  async runScanAndNotify(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'system';
      const result = await reorderService.runReorderScan(userId);
      ResponseHandler.success(res, result, 'Reorder scan complete');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reorder/create-draft-po
   * Create a draft purchase order for a supplier with suggested items
   */
  async createDraftPurchaseOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { supplierId, items, notes } = req.body;

      if (!supplierId || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ status: 'fail', message: 'supplierId and items are required' });
        return;
      }

      const result = await reorderService.createDraftPurchaseOrder(supplierId, items, notes, userId);
      ResponseHandler.success(res, result, 'Draft purchase order created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reorder/notify
   * Manually send low-stock notifications to managers
   */
  async notifyManagers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const suggestions = await reorderService.detectLowStock();
      const notifiedCount = await reorderService.notifyManagers(suggestions);
      ResponseHandler.success(
        res,
        { notifiedCount, lowStockCount: suggestions.length },
        `Notifications sent to ${notifiedCount} manager(s)`
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new ReorderController();
