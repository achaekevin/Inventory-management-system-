import { Router } from 'express';
import creditController from './credit.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', authorize('customers', 'read'), creditController.list.bind(creditController));
router.get('/overdue', authorize('customers', 'read'), creditController.overdue.bind(creditController));
router.get('/:customerId', authorize('customers', 'read'), creditController.profile.bind(creditController));
router.post('/:customerId/approve-limit', authorize('customers', 'update'), creditController.approveLimit.bind(creditController));
router.post('/:customerId/suspend', authorize('customers', 'update'), creditController.suspend.bind(creditController));
router.post('/:customerId/record-payment', authorize('customers', 'update'), creditController.recordPayment.bind(creditController));
router.post('/:customerId/adjust-balance', authorize('customers', 'update'), creditController.adjustBalance.bind(creditController));

export default router;
