import { Router } from 'express';
import workflowController from './workflow.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';

const router = Router();
router.use(authenticate);

// List & read
router.get('/purchases/pending', authorize('purchases', 'read'), workflowController.getPending.bind(workflowController));
router.get('/purchases', authorize('purchases', 'read'), workflowController.getAll.bind(workflowController));
router.get('/purchases/:id/history', authorize('purchases', 'read'), workflowController.getHistory.bind(workflowController));

// State transitions
router.post('/purchases/:id/submit', authorize('purchases', 'create'), workflowController.submit.bind(workflowController));
router.post('/purchases/:id/supervisor-approve', authorize('purchases', 'update'), workflowController.supervisorApprove.bind(workflowController));
router.post('/purchases/:id/supervisor-reject', authorize('purchases', 'update'), workflowController.supervisorReject.bind(workflowController));
router.post('/purchases/:id/finance-approve', authorize('purchases', 'update'), workflowController.financeApprove.bind(workflowController));
router.post('/purchases/:id/finance-reject', authorize('purchases', 'update'), workflowController.financeReject.bind(workflowController));
router.post('/purchases/:id/place-order', authorize('purchases', 'update'), workflowController.placeOrder.bind(workflowController));
router.post('/purchases/:id/receive-goods', authorize('purchases', 'update'), workflowController.receiveGoods.bind(workflowController));

export default router;
