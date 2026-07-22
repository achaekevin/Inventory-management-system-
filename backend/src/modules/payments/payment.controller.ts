import { Response, NextFunction } from 'express';
import paymentService from './payment.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class PaymentController {
  /**
   * Get all payments with pagination and filters
   */
  async getPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        saleId: req.query.saleId as string,
        method: req.query.method as string,
        status: req.query.status as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
      };

      const result = await paymentService.getPayments(filters);
      ResponseHandler.success(res, result.data, 'Payments retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      ResponseHandler.success(res, payment, 'Payment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new payment
   */
  async createPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const payment = await paymentService.createPayment(req.body, userId);
      ResponseHandler.created(res, payment, 'Payment created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update payment
   */
  async updatePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const payment = await paymentService.updatePayment(req.params.id, req.body, userId);
      ResponseHandler.success(res, payment, 'Payment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Void payment
   */
  async voidPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const payment = await paymentService.voidPayment(req.params.id, userId);
      ResponseHandler.success(res, payment, 'Payment voided successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await paymentService.deletePayment(req.params.id, userId);
      ResponseHandler.success(res, null, 'Payment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : undefined;
      const toDate = req.query.toDate ? new Date(req.query.toDate as string) : undefined;
      const summary = await paymentService.getPaymentSummary(fromDate, toDate);
      ResponseHandler.success(res, summary, 'Payment summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const methods = await paymentService.getPaymentMethods();
      ResponseHandler.success(res, methods, 'Payment methods retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
