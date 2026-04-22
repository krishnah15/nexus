import { Router } from 'express';
import * as controller from './countries.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createCountrySchema, updateCountrySchema, createPathwaySchema, updatePathwaySchema } from './countries.schema';

const router = Router();
router.use(authenticate);

router.get('/', controller.getCountries);
router.post('/', validate(createCountrySchema), controller.createCountry);
router.get('/:id', controller.getCountry);
router.patch('/:id', controller.updateCountry);
router.delete('/:id', controller.deleteCountry);

// Pathways
router.get('/:countryId/pathways', controller.getPathways);
router.post('/:countryId/pathways', validate(createPathwaySchema), controller.createPathway);
router.patch('/:countryId/pathways/:id', controller.updatePathway);
router.delete('/:countryId/pathways/:id', controller.deletePathway);

export default router;
