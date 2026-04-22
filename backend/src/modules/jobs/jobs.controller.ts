import { Response, NextFunction } from 'express';
import { AuthRequest, param } from '../../middleware/auth';
import * as jobsService from './jobs.service';
import { success, paginated } from '../../utils/api-response';

export async function getJobs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await jobsService.getJobs(req.userId!, req.query);
    return paginated(res, result.jobs, result.total, result.page, result.limit);
  } catch (err) { next(err); }
}

export async function getJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await jobsService.getJob(req.userId!, param(req, 'id'));
    return success(res, job);
  } catch (err) { next(err); }
}

export async function createJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await jobsService.createJob(req.userId!, req.body);
    return success(res, job, 201);
  } catch (err) { next(err); }
}

export async function updateJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await jobsService.updateJob(req.userId!, param(req, 'id'), req.body);
    return success(res, job);
  } catch (err) { next(err); }
}

export async function deleteJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await jobsService.deleteJob(req.userId!, param(req, 'id'));
    return success(res, { message: 'Job deleted' });
  } catch (err) { next(err); }
}

export async function scrapeJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await jobsService.scrapeJob(req.body.url);
    return success(res, data);
  } catch (err) { next(err); }
}

// Interviews
export async function getInterviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const interviews = await jobsService.getInterviews(req.userId!, param(req, 'jobId'));
    return success(res, interviews);
  } catch (err) { next(err); }
}

export async function createInterview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const interview = await jobsService.createInterview(req.userId!, param(req, 'jobId'), req.body);
    return success(res, interview, 201);
  } catch (err) { next(err); }
}

export async function updateInterview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const interview = await jobsService.updateInterview(req.userId!, param(req, 'jobId'), param(req, 'id'), req.body);
    return success(res, interview);
  } catch (err) { next(err); }
}

export async function deleteInterview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await jobsService.deleteInterview(req.userId!, param(req, 'jobId'), param(req, 'id'));
    return success(res, { message: 'Interview deleted' });
  } catch (err) { next(err); }
}
