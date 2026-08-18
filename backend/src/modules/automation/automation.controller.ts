import { Response, NextFunction } from 'express';
import automationService from './automation.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';
import { BadRequestError } from '../../common/errors/AppError';

const VALID_TYPES = ['low_stock_po', 'high_value_notify', 'overdue_payment_reminder', 'archive_inactive_product'];

export class AutomationController {

  /** GET /api/automation/rules */
  async listRules(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await automationService.listRules();
      ResponseHandler.success(res, rules);
    } catch (err) { next(err); }
  }

  /** POST /api/automation/rules */
  async createRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, type, config, isEnabled, intervalHours } = req.body;

      if (!name || !type || !config) {
        throw new BadRequestError('name, type, and config are required');
      }
      if (!VALID_TYPES.includes(type)) {
        throw new BadRequestError(`Invalid rule type. Must be one of: ${VALID_TYPES.join(', ')}`);
      }

      const rule = await automationService.createRule({
        name,
        description,
        type,
        config,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        intervalHours: intervalHours || 24,
        createdBy: req.user!.id,
      });

      ResponseHandler.success(res, rule, 'Automation rule created', 201);
    } catch (err) { next(err); }
  }

  /** PATCH /api/automation/rules/:id */
  async updateRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, config, isEnabled, intervalHours } = req.body;
      const rule = await automationService.updateRule(req.params.id as string, {
        name,
        description,
        config,
        isEnabled,
        intervalHours,
      });
      ResponseHandler.success(res, rule, 'Automation rule updated');
    } catch (err) { next(err); }
  }

  /** DELETE /api/automation/rules/:id */
  async deleteRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await automationService.deleteRule(req.params.id as string);
      ResponseHandler.success(res, null, 'Automation rule deleted');
    } catch (err) { next(err); }
  }

  /** POST /api/automation/rules/:id/run */
  async runRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { result, log } = await automationService.runRule(req.params.id as string);
      ResponseHandler.success(res, { result, log }, `Rule executed: ${result.itemsAffected} item(s) affected`);
    } catch (err) { next(err); }
  }

  /** GET /api/automation/rules/:id/logs */
  async getRuleLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await automationService.getRuleLogs(req.params.id as string, limit);
      ResponseHandler.success(res, logs);
    } catch (err) { next(err); }
  }

  /** GET /api/automation/logs */
  async getAllLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await automationService.getAllLogs(limit);
      ResponseHandler.success(res, logs);
    } catch (err) { next(err); }
  }
}

export default new AutomationController();
