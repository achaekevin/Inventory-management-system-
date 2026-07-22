import { Response, NextFunction } from 'express';
import warehouseService from './warehouse.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class WarehouseController {
  // ==================== WAREHOUSES ====================

  async getWarehouses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        city: req.query.city as string,
        state: req.query.state as string,
      };

      const result = await warehouseService.getWarehouses(filters);
      ResponseHandler.success(res, result.data, 'Warehouses retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getWarehouseById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouse = await warehouseService.getWarehouseById(req.params.id);
      ResponseHandler.success(res, warehouse, 'Warehouse retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const warehouse = await warehouseService.createWarehouse(req.body, userId);
      ResponseHandler.created(res, warehouse, 'Warehouse created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body, userId);
      ResponseHandler.success(res, warehouse, 'Warehouse updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await warehouseService.deleteWarehouse(req.params.id, userId);
      ResponseHandler.success(res, null, 'Warehouse deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const warehouse = await warehouseService.restoreWarehouse(req.params.id, userId);
      ResponseHandler.success(res, warehouse, 'Warehouse restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWarehouseCapacity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const capacity = await warehouseService.getWarehouseCapacity(req.params.id);
      ResponseHandler.success(res, capacity, 'Warehouse capacity retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== ZONES ====================

  async getZonesByWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
      };

      const result = await warehouseService.getZonesByWarehouse(req.params.warehouseId, filters);
      ResponseHandler.success(res, result.data, 'Zones retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getZoneById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const zone = await warehouseService.getZoneById(req.params.id);
      ResponseHandler.success(res, zone, 'Zone retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createZone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const zone = await warehouseService.createZone(req.body, userId);
      ResponseHandler.created(res, zone, 'Zone created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateZone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const zone = await warehouseService.updateZone(req.params.id, req.body, userId);
      ResponseHandler.success(res, zone, 'Zone updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteZone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await warehouseService.deleteZone(req.params.id, userId);
      ResponseHandler.success(res, null, 'Zone deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== BINS ====================

  async getBinsByZone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
      };

      const result = await warehouseService.getBinsByZone(req.params.zoneId, filters);
      ResponseHandler.success(res, result.data, 'Bins retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getBinById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bin = await warehouseService.getBinById(req.params.id);
      ResponseHandler.success(res, bin, 'Bin retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createBin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const bin = await warehouseService.createBin(req.body, userId);
      ResponseHandler.created(res, bin, 'Bin created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateBin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const bin = await warehouseService.updateBin(req.params.id, req.body, userId);
      ResponseHandler.success(res, bin, 'Bin updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await warehouseService.deleteBin(req.params.id, userId);
      ResponseHandler.success(res, null, 'Bin deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new WarehouseController();
