import { Response, NextFunction } from 'express';
import { AuthRequest, param } from '../../middleware/auth';
import * as dsaService from './dsa.service';
import { success, paginated } from '../../utils/api-response';

export async function getProblems(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await dsaService.getProblems(req.userId!, req.query);
    return paginated(res, result.problems, result.total, result.page, result.limit);
  } catch (err) { next(err); }
}

export async function getProblem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const problem = await dsaService.getProblem(req.userId!, param(req, 'id'));
    return success(res, problem);
  } catch (err) { next(err); }
}

export async function createProblem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const problem = await dsaService.createProblem(req.userId!, req.body);
    return success(res, problem, 201);
  } catch (err) { next(err); }
}

export async function updateProblem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const problem = await dsaService.updateProblem(req.userId!, param(req, 'id'), req.body);
    return success(res, problem);
  } catch (err) { next(err); }
}

export async function deleteProblem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await dsaService.deleteProblem(req.userId!, param(req, 'id'));
    return success(res, { message: 'Problem deleted' });
  } catch (err) { next(err); }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await dsaService.getStats(req.userId!);
    return success(res, stats);
  } catch (err) { next(err); }
}
