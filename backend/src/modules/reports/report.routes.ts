import { Router } from 'express';
import reportController from './report.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get sales report
router.get(
  '/sales',
  authorize('reports', 'read'),
  reportController.getSalesReport
);

// Get purchase report
router.get(
  '/purchases',
  authorize('reports', 'read'),
  reportController.getPurchaseReport
);

// Get inventory report
router.get(
  '/inventory',
  authorize('reports', 'read'),
  reportController.getInventoryReport
);

// Get product performance report
router.get(
  '/products/performance',
  authorize('reports', 'read'),
  reportController.getProductPerformanceReport
);

// Get customer report
router.get(
  '/customers',
  authorize('reports', 'read'),
  reportController.getCustomerReport
);

// Get profit and loss report
router.get(
  '/profit-loss',
  authorize('reports', 'read'),
  reportController.getProfitLossReport
);

// Get low stock report
router.get(
  '/low-stock',
  authorize('reports', 'read'),
  reportController.getLowStockReport
);

export default router;
