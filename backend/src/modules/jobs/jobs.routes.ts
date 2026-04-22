import { Router } from 'express';
import * as jobsController from './jobs.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createJobSchema, updateJobSchema, scrapeJobSchema } from './jobs.schema';

const router = Router();

router.use(authenticate);

router.get('/', jobsController.getJobs);
router.post('/', validate(createJobSchema), jobsController.createJob);
router.post('/scrape', validate(scrapeJobSchema), jobsController.scrapeJob);
router.get('/:id', jobsController.getJob);
router.patch('/:id', jobsController.updateJob);
router.delete('/:id', jobsController.deleteJob);

// Interviews
router.get('/:jobId/interviews', jobsController.getInterviews);
router.post('/:jobId/interviews', jobsController.createInterview);
router.patch('/:jobId/interviews/:id', jobsController.updateInterview);
router.delete('/:jobId/interviews/:id', jobsController.deleteInterview);

export default router;
