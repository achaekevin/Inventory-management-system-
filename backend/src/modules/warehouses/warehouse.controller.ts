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
      ResponseHandler.success(res, result.data, 'Warehouses retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getWarehouseById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouseId = (req.params as any).id;
      const warehouse = await warehouseService.getWarehouseById(warehouseId);
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
      const warehouseId = (req.params as any).id;
      const warehouse = await warehouseService.updateWarehouse(warehouseId, req.body, userId);
      ResponseHandler.success(res, warehouse, 'Warehouse updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const warehouseId = (req.params as any).id;
      await warehouseService.deleteWarehouse(warehouseId, userId);
      ResponseHandler.success(res, null, 'Warehouse deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreWarehouse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const warehouseId = (req.params as any).id;
      const warehouse = await warehouseService.restoreWarehouse(warehouseId, userId);
      ResponseHandler.success(res, warehouse, 'Warehouse restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWarehouseCapacity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouseId = (req.params as any).id;
      const capacity = await warehouseService.getWarehouseCapacity(warehouseId);
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

      const warehouseId = (req.params as any).warehouseId;
      const result = await warehouseService.getZonesByWarehouse(warehouseId, filters);
      ResponseHandler.success(res, result.data, 'Zones retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getZoneById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const zoneId = (req.params as any).id;
      const zone = await warehouseService.getZoneById(zoneId);
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
      const zoneId = (req.params as any).id;
      const zone = await warehouseService.updateZone(zoneId, req.body, userId);
      ResponseHandler.success(res, zone, 'Zone updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteZone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const zoneId = (req.params as any).id;
      await warehouseService.deleteZone(zoneId, userId);
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

      const zoneId = (req.params as any).zoneId;
      const result = await warehouseService.getBinsByZone(zoneId, filters);
      ResponseHandler.success(res, result.data, 'Bins retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getBinById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const binId = (req.params as any).id;
      const bin = await warehouseService.getBinById(binId);
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
      const binId = (req.params as any).id;
      const bin = await warehouseService.updateBin(binId, req.body, userId);
      ResponseHandler.success(res, bin, 'Bin updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const binId = (req.params as any).id;
      await warehouseService.deleteBin(binId, userId);
      ResponseHandler.success(res, null, 'Bin deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new WarehouseController();
