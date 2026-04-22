import { Router } from 'express';
import * as controller from './job-matching.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { extractSkillsSchema } from './job-matching.schema';

const router = Router();
router.use(authenticate);

router.post('/skills', validate(extractSkillsSchema), controller.extractSkills);
router.get('/skills', controller.getSkillProfile);
router.get('/roles', controller.getSuggestedRoles);
router.delete('/skills', controller.deleteSkillProfile);
router.get('/jobs', controller.getMatchingJobs);

export default router;
