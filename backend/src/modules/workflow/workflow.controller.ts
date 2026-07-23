import { Response, NextFunction } from 'express';
import workflowService from './workflow.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class WorkflowController {
  /** GET /api/workflow/purchases/pending - items waiting for my action */
  async getPending(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const purchases = await workflowService.getPendingForUser(userId);
      ResponseHandler.success(res, purchases);
    } catch (err) { next(err); }
  }

  /** GET /api/workflow/purchases - all purchases (admin / full view) */
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search } = req.query as { status?: string; search?: string };
      const purchases = await workflowService.getAllWorkflowPurchases({ status, search });
      ResponseHandler.success(res, purchases);
    } catch (err) { next(err); }
  }

  /** GET /api/workflow/purchases/:id/history */
  async getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchase = await workflowService.getPurchaseWithHistory(String(req.params.id));
      ResponseHandler.success(res, purchase);
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/submit */
  async submit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.submitForApproval(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Purchase submitted for approval');
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/supervisor-approve */
  async supervisorApprove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.supervisorApprove(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Purchase approved by supervisor');
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/supervisor-reject */
  async supervisorReject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.supervisorReject(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Purchase rejected by supervisor');
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/finance-approve */
  async financeApprove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.financeApprove(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Purchase approved by finance');
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/finance-reject */
  async financeReject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.financeReject(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Purchase rejected by finance');
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/place-order */
  async placeOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.placeOrder(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Supplier order placed');
    } catch (err) { next(err); }
  }

  /** POST /api/workflow/purchases/:id/receive-goods */
  async receiveGoods(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workflowService.receiveGoods(String(req.params.id), req.user!.id, req.body.comment);
      ResponseHandler.success(res, result, 'Goods received successfully');
    } catch (err) { next(err); }
  }
}

export default new WorkflowController();
