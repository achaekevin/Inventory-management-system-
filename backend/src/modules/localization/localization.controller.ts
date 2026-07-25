import { Response, NextFunction } from 'express';
import localizationService from './localization.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class LocalizationController {
  /**
   * GET /api/localization/settings
   */
  async getSettings(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await localizationService.getSettings();
      ResponseHandler.success(res, config, 'Localization settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/localization/settings
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await localizationService.updateSettings(req.body);
      ResponseHandler.success(res, updated, 'Localization settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/localization/convert-currency
   */
  async convertCurrency(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      const result = await localizationService.convertCurrency(
        Number(amount) || 0,
        fromCurrency || 'USD',
        toCurrency || 'EUR'
      );
      ResponseHandler.success(res, result, 'Currency converted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/localization/calculate-tax
   */
  async calculateTax(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { subtotal, taxRate, mode } = req.body;
      const result = localizationService.calculateTax(
        Number(subtotal) || 0,
        Number(taxRate) || 0,
        mode || 'exclusive'
      );
      ResponseHandler.success(res, result, 'Tax calculated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new LocalizationController();
