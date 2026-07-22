import { Router } from 'express';
import dashboardController from './dashboard.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get(
  '/stats',
  authorize('dashboard', 'read'),
  dashboardController.getDashboardStats
);

// Get recent activities
router.get(
  '/activities',
  authorize('dashboard', 'read'),
  dashboardController.getRecentActivities
);

// Get top selling products
router.get(
  '/top-products',
  authorize('dashboard', 'read'),
  dashboardController.getTopSellingProducts
);

// Get recent sales
router.get(
  '/recent-sales',
  authorize('dashboard', 'read'),
  dashboardController.getRecentSales
);

// Get sales chart data
router.get(
  '/sales-chart',
  authorize('dashboard', 'read'),
  dashboardController.getSalesChartData
);

// Get payment methods distribution
router.get(
  '/payment-methods',
  authorize('dashboard', 'read'),
  dashboardController.getPaymentMethodsDistribution
);

// Get low stock alerts
router.get(
  '/low-stock-alerts',
  authorize('dashboard', 'read'),
  dashboardController.getLowStockAlerts
);

// Get pending orders summary
router.get(
  '/pending-orders',
  authorize('dashboard', 'read'),
  dashboardController.getPendingOrders
);

export default router;
