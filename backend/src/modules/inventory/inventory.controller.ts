import { Response, NextFunction } from 'express';
import inventoryService from './inventory.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class InventoryController {
  // ==================== INVENTORY ITEMS ====================

  async getInventoryItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        warehouseId: req.query.warehouseId as string,
        productId: req.query.productId as string,
        lowStock: req.query.lowStock === 'true',
      };

      const result = await inventoryService.getInventoryItems(filters);
      ResponseHandler.success(res, result.data, 'Inventory items retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, warehouseId } = req.params;
      const item = await inventoryService.getInventoryItem(productId, warehouseId);
      ResponseHandler.success(res, item, 'Inventory item retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async initializeInventoryItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, warehouseId } = req.body;
      const item = await inventoryService.initializeInventoryItem(productId, warehouseId);
      ResponseHandler.created(res, item, 'Inventory item initialized successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== STOCK ADJUSTMENTS ====================

  async createStockAdjustment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await inventoryService.createStockAdjustment(req.body, userId);
      ResponseHandler.created(res, result, 'Stock adjustment created successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== STOCK TRANSFERS ====================

  async transferStock(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await inventoryService.transferStock(req.body, userId);
      ResponseHandler.created(res, result, 'Stock transfer completed successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== STOCK MOVEMENTS ====================

  async getStockMovements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        productId: req.query.productId as string,
        warehouseId: req.query.warehouseId as string,
        movementType: req.query.movementType as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await inventoryService.getStockMovements(filters);
      ResponseHandler.success(res, result.data, 'Stock movements retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getStockMovementById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const movement = await inventoryService.getStockMovementById(req.params.id);
      ResponseHandler.success(res, movement, 'Stock movement retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== STOCK RESERVATION ====================

  async reserveStock(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { productId, warehouseId, quantity } = req.body;
      const item = await inventoryService.reserveStock(productId, warehouseId, quantity, userId);
      ResponseHandler.success(res, item, 'Stock reserved successfully');
    } catch (error) {
      next(error);
    }
  }

  async releaseReservedStock(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { productId, warehouseId, quantity } = req.body;
      const item = await inventoryService.releaseReservedStock(productId, warehouseId, quantity, userId);
      ResponseHandler.success(res, item, 'Reserved stock released successfully');
    } catch (error) {
      next(error);
    }
  }

  async consumeReservedStock(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { productId, warehouseId, quantity } = req.body;
      const result = await inventoryService.consumeReservedStock(productId, warehouseId, quantity, userId);
      ResponseHandler.success(res, result, 'Reserved stock consumed successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== VALUATION ====================

  async calculateInventoryValue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const method = (req.query.method as any) || 'WEIGHTED_AVERAGE';
      const result = await inventoryService.calculateInventoryValue(warehouseId, method);
      ResponseHandler.success(res, result, 'Inventory value calculated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
