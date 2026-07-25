import { Response, NextFunction } from 'express';
import inventoryHeatmapService from './inventory-heatmap.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class InventoryHeatmapController {
  /**
   * GET /api/inventory-heatmap/data
   */
  async getHeatmapData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        warehouseId: req.query.warehouseId as string,
        classification: req.query.classification as string,
      };

      const data = await inventoryHeatmapService.getHeatmapData(query);
      ResponseHandler.success(res, data, 'Inventory heat map data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryHeatmapController();
