import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as dashboardService from './dashboard.service';
import { success } from '../../utils/api-response';

export async function getOverview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getOverview(req.userId!);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function getJobsFunnel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getJobsFunnel(req.userId!);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function getLearningProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getLearningProgress(req.userId!);
    return success(res, data);
  } catch (err) { next(err); }
}
