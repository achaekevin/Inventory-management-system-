import { Router } from 'express';
import automationController from './automation.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';

const router = Router();
router.use(authenticate);

// All automation endpoints are admin/settings level
router.get('/rules', authorize('settings', 'read'), automationController.listRules.bind(automationController));
router.post('/rules', authorize('settings', 'manage'), automationController.createRule.bind(automationController));
router.patch('/rules/:id', authorize('settings', 'manage'), automationController.updateRule.bind(automationController));
router.delete('/rules/:id', authorize('settings', 'manage'), automationController.deleteRule.bind(automationController));
router.post('/rules/:id/run', authorize('settings', 'manage'), automationController.runRule.bind(automationController));
router.get('/rules/:id/logs', authorize('settings', 'read'), automationController.getRuleLogs.bind(automationController));
router.get('/logs', authorize('settings', 'read'), automationController.getAllLogs.bind(automationController));

export default router;
