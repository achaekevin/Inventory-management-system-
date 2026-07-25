import { Router } from 'express';
import localizationController from './localization.controller';
import { authenticate } from '../../common/middleware/authenticate';

const router = Router();

// Protect all localization routes with authentication
router.use(authenticate);

// Localization settings
router.get('/settings', localizationController.getSettings);
router.put('/settings', localizationController.updateSettings);

// Helpers
router.post('/convert-currency', localizationController.convertCurrency);
router.post('/calculate-tax', localizationController.calculateTax);

export default router;
