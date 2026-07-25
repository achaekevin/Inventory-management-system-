import { Router } from 'express';
import inventoryHeatmapController from './inventory-heatmap.controller';
import { authenticate } from '../../common/middleware/authenticate';

const router = Router();

// Protect all heatmap routes with authentication
router.use(authenticate);

// Heatmap analytics route
router.get('/data', inventoryHeatmapController.getHeatmapData);

export default router;
