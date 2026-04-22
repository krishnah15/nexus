import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as jobMatchingService from './job-matching.service';
import { success } from '../../utils/api-response';

export async function extractSkills(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await jobMatchingService.extractAndSaveSkillProfile(req.userId!, req.body.documentId);
    return success(res, profile, 201);
  } catch (err) { next(err); }
}

export async function getSkillProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await jobMatchingService.getSkillProfile(req.userId!);
    return success(res, profile);
  } catch (err) { next(err); }
}

export async function getSuggestedRoles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const country = (req.query.country as string) || 'in';
    const roles = await jobMatchingService.getSuggestedRoles(req.userId!, country);
    return success(res, roles);
  } catch (err) { next(err); }
}

export async function deleteSkillProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await jobMatchingService.deleteSkillProfile(req.userId!);
    return success(res, { deleted: true });
  } catch (err) { next(err); }
}

export async function getMatchingJobs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await jobMatchingService.getMatchingJobs(req.userId!, {
      location: req.query.location as string | undefined,
      country: req.query.country as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      minMatch: req.query.minMatch ? parseInt(req.query.minMatch as string) : 30,
    });
    return success(res, result);
  } catch (err) { next(err); }
}
