import { Router } from 'express';
import * as controller from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/overview', controller.getOverview);
router.get('/jobs-funnel', controller.getJobsFunnel);
router.get('/learning-progress', controller.getLearningProgress);

export default router;
