import { Router } from 'express';
import reorderController from './reorder.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';

const router = Router();

router.use(authenticate);

// Scan for low stock and return suggestions
router.get(
  '/scan',
  authorize('inventory', 'read'),
  reorderController.scanLowStock.bind(reorderController)
);

// Full scan + notify managers
router.post(
  '/scan-and-notify',
  authorize('inventory', 'read'),
  reorderController.runScanAndNotify.bind(reorderController)
);

// Create a draft purchase order from reorder suggestions
router.post(
  '/create-draft-po',
  authorize('purchases', 'create'),
  reorderController.createDraftPurchaseOrder.bind(reorderController)
);

// Manually notify managers about low stock
router.post(
  '/notify',
  authorize('inventory', 'read'),
  reorderController.notifyManagers.bind(reorderController)
);

export default router;
