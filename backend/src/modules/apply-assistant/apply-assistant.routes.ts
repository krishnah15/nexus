import { Router } from 'express';
import * as controller from './apply-assistant.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { prepareApplicationSchema, coverLetterSchema } from './apply-assistant.schema';

const router = Router();
router.use(authenticate);

router.get('/status', controller.getAiStatus);
router.post('/prepare', validate(prepareApplicationSchema), controller.prepareApplication);
router.post('/cover-letter', validate(coverLetterSchema), controller.getCoverLetter);

export default router;
