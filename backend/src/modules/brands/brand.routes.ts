import { Router } from 'express';
import brandController from './brand.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createBrandSchema,
  updateBrandSchema,
  brandIdSchema,
} from './brand.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('brands', 'read'), brandController.getBrands);
router.get('/:id', authorize('brands', 'read'), validate(brandIdSchema), brandController.getBrandById);
router.post('/', authorize('brands', 'create'), validate(createBrandSchema), brandController.createBrand);
router.put('/:id', authorize('brands', 'update'), validate(brandIdSchema), validate(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', authorize('brands', 'delete'), validate(brandIdSchema), brandController.deleteBrand);
router.post('/:id/restore', authorize('brands', 'delete'), validate(brandIdSchema), brandController.restoreBrand);

export default router;
