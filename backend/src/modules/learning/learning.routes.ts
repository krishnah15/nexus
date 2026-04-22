import { Router } from 'express';
import * as controller from './learning.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createLearningSchema, updateLearningSchema } from './learning.schema';

const router = Router();
router.use(authenticate);

router.get('/', controller.getItems);
router.post('/', validate(createLearningSchema), controller.createItem);
router.get('/:id', controller.getItem);
router.patch('/:id', controller.updateItem);
router.delete('/:id', controller.deleteItem);

export default router;
