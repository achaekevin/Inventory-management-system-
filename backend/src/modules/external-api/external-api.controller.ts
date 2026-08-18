import { Response, NextFunction } from 'express';
import externalApiService from './external-api.service';
import { ResponseHandler } from '../../common/utilities/response';
import { ExternalApiRequest } from '../../common/middleware/external-api.middleware';

export class ExternalApiController {
  // Mobile Apps
  async getMobileSync(_req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = await externalApiService.getMobileSyncPayload();
      ResponseHandler.success(res, payload, 'Mobile sync payload retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createMobileSale(req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.apiTokenInfo?.userId || 'mobile-user';
      const result = await externalApiService.createMobileSale(req.body, userId);
      ResponseHandler.created(res, result, 'Mobile sale created successfully');
    } catch (error) {
      next(error);
    }
  }

  // Barcode Scanners
  async scanBarcode(req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { barcode } = req.params;
      const product = await externalApiService.scanBarcode(barcode as string);
      ResponseHandler.success(res, product, 'Product scanned successfully');
    } catch (error) {
      next(error);
    }
  }

  async adjustStockByScanner(req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.apiTokenInfo?.userId || 'scanner-user';
      const result = await externalApiService.adjustStockByScanner(req.body, userId);
      ResponseHandler.success(res, result, 'Barcode scanner stock adjusted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Third-Party Integrations
  async getProductsCatalog(req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const catalog = await externalApiService.getProductsCatalog(req.query);
      ResponseHandler.success(res, catalog, 'Products catalog retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getInventoryLevels(_req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const levels = await externalApiService.getInventoryLevels();
      ResponseHandler.success(res, levels, 'Inventory levels retrieved');
    } catch (error) {
      next(error);
    }
  }

  // External Systems
  async ingestExternalEvent(req: ExternalApiRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenName = req.apiTokenInfo?.name || 'External System';
      const result = await externalApiService.ingestExternalEvent(req.body, tokenName);
      ResponseHandler.success(res, result, 'External event ingested');
    } catch (error) {
      next(error);
    }
  }
}

export default new ExternalApiController();
