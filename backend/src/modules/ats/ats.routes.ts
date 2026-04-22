import { Router } from 'express';
import * as controller from './ats.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { atsCheckSchema } from './ats.schema';

const router = Router();
router.use(authenticate);

router.post('/', validate(atsCheckSchema), controller.checkAtsScore);
router.get('/', controller.getAtsHistory);
router.get('/:id', controller.getAtsCheck);
router.delete('/:id', controller.deleteAtsCheck);

export default router;
