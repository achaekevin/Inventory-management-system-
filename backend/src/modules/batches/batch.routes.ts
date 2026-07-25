import { Router } from 'express';
import batchController from './batch.controller';
import { authenticate } from '../../common/middleware/authenticate';

const router = Router();

// Protect all batch routes with authentication
router.use(authenticate);

// Batches CRUD
router.get('/', batchController.getBatches);
router.post('/', batchController.createBatch);

// Movements & Recalls
router.post('/movements', batchController.recordMovement);
router.get('/recalls', batchController.getRecalls);
router.post('/recall', batchController.initiateRecall);

export default router;
