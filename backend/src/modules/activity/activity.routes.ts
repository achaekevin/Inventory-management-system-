import { Router } from 'express';
import activityController from './activity.controller';
import { authenticate } from '../../common/middleware/authenticate';

const router = Router();

// Protect all activity routes with authentication
router.use(authenticate);

// Activity Timeline
router.get('/timeline', activityController.getTimeline);

export default router;
