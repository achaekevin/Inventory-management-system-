import { Router } from 'express';
import externalApiController from './external-api.controller';
import { authenticateExternalApiKey } from '../../common/middleware/external-api.middleware';

const router = Router();

// Protect all external REST API endpoints with API Key authentication
router.use(authenticateExternalApiKey);

// Mobile Apps API
router.get('/mobile/sync', externalApiController.getMobileSync);
router.post('/mobile/sales', externalApiController.createMobileSale);

// Barcode Scanners API
router.get('/scanner/scan/:barcode', externalApiController.scanBarcode);
router.post('/scanner/adjust-stock', externalApiController.adjustStockByScanner);

// Third-Party Integrations API
router.get('/products', externalApiController.getProductsCatalog);
router.get('/inventory', externalApiController.getInventoryLevels);

// External Systems & Webhooks Ingestion
router.post('/webhooks', externalApiController.ingestExternalEvent);

export default router;
