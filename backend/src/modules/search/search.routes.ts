import { Router } from 'express';
import searchController from './search.controller';
import { authenticate } from '../../common/middleware/authenticate';

const router = Router();

// Protect all search routes with authentication
router.use(authenticate);

// Global search route
router.get('/', searchController.globalSearch);

// Fast autocomplete route
router.get('/autocomplete', searchController.autocomplete);

export default router;
