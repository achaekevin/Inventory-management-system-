import { Response, NextFunction } from 'express';
import activityService from './activity.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class ActivityController {
  /**
   * GET /api/activity/timeline
   */
  async getTimeline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        module: req.query.module as string,
        action: req.query.action as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await activityService.getTimelineEvents(filters);
      ResponseHandler.success(
        res,
        result.events,
        'Activity timeline events retrieved successfully',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new ActivityController();
