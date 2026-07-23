import { Response, NextFunction } from 'express';
import creditService from './credit.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class CreditController {
  /** GET /api/credit - list all customers with credit summary */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, creditStatus } = req.query as { search?: string; creditStatus?: string };
      const data = await creditService.getCreditSummaryList({ search, creditStatus });
      ResponseHandler.success(res, data);
    } catch (err) { next(err); }
  }

  /** GET /api/credit/overdue - customers with overdue balances */
  async overdue(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await creditService.getOverdueSummary();
      ResponseHandler.success(res, data);
    } catch (err) { next(err); }
  }

  /** GET /api/credit/:customerId - full credit profile */
  async profile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await creditService.getCreditProfile(String(req.params.customerId));
      ResponseHandler.success(res, data);
    } catch (err) { next(err); }
  }

  /** POST /api/credit/:customerId/approve-limit */
  async approveLimit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { creditLimit, notes, dueDate } = req.body;
      if (!creditLimit || isNaN(Number(creditLimit))) {
        res.status(400).json({ status: 'fail', message: 'creditLimit is required' });
        return;
      }
      const data = await creditService.approveCreditLimit(
        String(req.params.customerId),
        { creditLimit: Number(creditLimit), notes, dueDate: dueDate ? new Date(dueDate) : undefined },
        req.user!.id
      );
      ResponseHandler.success(res, data, 'Credit limit approved successfully');
    } catch (err) { next(err); }
  }

  /** POST /api/credit/:customerId/suspend */
  async suspend(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await creditService.suspendCredit(
        String(req.params.customerId),
        req.body.notes || '',
        req.user!.id
      );
      ResponseHandler.success(res, data, 'Credit suspended');
    } catch (err) { next(err); }
  }

  /** POST /api/credit/:customerId/record-payment */
  async recordPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, notes, referenceId, referenceType, dueDate } = req.body;
      if (!amount || isNaN(Number(amount))) {
        res.status(400).json({ status: 'fail', message: 'amount is required' });
        return;
      }
      const data = await creditService.recordPayment(
        String(req.params.customerId),
        { amount: Number(amount), type: 'payment_received', notes, referenceId, referenceType, dueDate: dueDate ? new Date(dueDate) : undefined },
        req.user!.id
      );
      ResponseHandler.success(res, data, 'Payment recorded successfully');
    } catch (err) { next(err); }
  }

  /** POST /api/credit/:customerId/adjust-balance */
  async adjustBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, notes } = req.body;
      if (amount === undefined || isNaN(Number(amount))) {
        res.status(400).json({ status: 'fail', message: 'amount is required' });
        return;
      }
      const data = await creditService.adjustBalance(
        String(req.params.customerId),
        { amount: Number(amount), type: 'balance_adjusted', notes },
        req.user!.id
      );
      ResponseHandler.success(res, data, 'Balance adjusted');
    } catch (err) { next(err); }
  }
}

export default new CreditController();
