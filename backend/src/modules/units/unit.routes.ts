import { Router } from 'express';
import unitController from './unit.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
  createUnitSchema,
  updateUnitSchema,
  unitIdSchema,
} from './unit.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('units', 'read'), unitController.getUnits);
router.get('/:id', authorize('units', 'read'), validate(unitIdSchema), unitController.getUnitById);
router.post('/', authorize('units', 'create'), validate(createUnitSchema), unitController.createUnit);
router.put('/:id', authorize('units', 'update'), validate(unitIdSchema), validate(updateUnitSchema), unitController.updateUnit);
router.delete('/:id', authorize('units', 'delete'), validate(unitIdSchema), unitController.deleteUnit);
router.post('/:id/restore', authorize('units', 'delete'), validate(unitIdSchema), unitController.restoreUnit);

export default router;
