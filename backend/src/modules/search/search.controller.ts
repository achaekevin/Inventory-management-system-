import { Response, NextFunction } from 'express';
import searchService from './search.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class SearchController {
  /**
   * GET /api/search
   * Global search across products, customers, suppliers, orders, invoices, users
   */
  async globalSearch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = {
        q: req.query.q as string,
        type: req.query.type as any,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await searchService.globalSearch(options);

      ResponseHandler.success(
        res,
        {
          results: result.results,
          counts: result.counts,
        },
        'Search results retrieved successfully',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/search/autocomplete
   * Fast autocomplete suggestions for live search
   */
  async autocomplete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const suggestions = await searchService.autocomplete(q);
      ResponseHandler.success(res, suggestions, 'Autocomplete suggestions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
