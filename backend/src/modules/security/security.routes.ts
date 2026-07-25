import { Router } from 'express';
import securityController from './security.controller';
import { authenticate } from '../../common/middleware/authenticate';

const router = Router();

// Protect all security routes with authentication
router.use(authenticate);

// 2FA
router.get('/2fa/status', securityController.get2FAStatus);
router.post('/2fa/generate', securityController.generate2FASecret);
router.post('/2fa/enable', securityController.enable2FA);
router.post('/2fa/disable', securityController.disable2FA);

// Sessions
router.get('/sessions', securityController.getSessions);
router.delete('/sessions/other', securityController.revokeOtherSessions);
router.delete('/sessions/:id', securityController.revokeSession);

// Login History
router.get('/login-history', securityController.getLoginHistory);

// Password Policy
router.get('/password-policy', securityController.getPasswordPolicy);
router.put('/password-policy', securityController.updatePasswordPolicy);

// API Tokens
router.get('/tokens', securityController.getApiTokens);
router.post('/tokens', securityController.createApiToken);
router.delete('/tokens/:id', securityController.revokeApiToken);

export default router;
