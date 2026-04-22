import { Router } from 'express';
import * as controller from './dsa.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createDsaSchema, updateDsaSchema } from './dsa.schema';

const router = Router();
router.use(authenticate);

router.get('/stats', controller.getStats);
router.get('/', controller.getProblems);
router.post('/', validate(createDsaSchema), controller.createProblem);
router.get('/:id', controller.getProblem);
router.patch('/:id', controller.updateProblem);
router.delete('/:id', controller.deleteProblem);

export default router;
