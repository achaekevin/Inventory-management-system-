import { Response, NextFunction } from 'express';
import dashboardService from './dashboard.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class DashboardController {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats();
      ResponseHandler.success(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const activities = await dashboardService.getRecentActivities(limit);
      ResponseHandler.success(res, activities, 'Recent activities retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const days = req.query.days ? Number(req.query.days) : 30;
      const products = await dashboardService.getTopSellingProducts(limit, days);
      ResponseHandler.success(res, products, 'Top selling products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent sales
   */
  async getRecentSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const sales = await dashboardService.getRecentSales(limit);
      ResponseHandler.success(res, sales, 'Recent sales retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales chart data
   */
  async getSalesChartData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const chartData = await dashboardService.getSalesChartData(days);
      ResponseHandler.success(res, chartData, 'Sales chart data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment methods distribution
   */
  async getPaymentMethodsDistribution(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const distribution = await dashboardService.getPaymentMethodsDistribution(days);
      ResponseHandler.success(res, distribution, 'Payment methods distribution retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const alerts = await dashboardService.getLowStockAlerts(limit);
      ResponseHandler.success(res, alerts, 'Low stock alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending orders summary
   */
  async getPendingOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pending = await dashboardService.getPendingOrders();
      ResponseHandler.success(res, pending, 'Pending orders summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
