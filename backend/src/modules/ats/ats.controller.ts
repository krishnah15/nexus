import { Response, NextFunction } from 'express';
import { AuthRequest, param } from '../../middleware/auth';
import * as atsService from './ats.service';
import { success } from '../../utils/api-response';

export async function checkAtsScore(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await atsService.checkAtsScore(req.userId!, req.body);
    return success(res, result, 201);
  } catch (err) { next(err); }
}

export async function getAtsHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const history = await atsService.getAtsHistory(req.userId!);
    return success(res, history);
  } catch (err) { next(err); }
}

export async function getAtsCheck(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const check = await atsService.getAtsCheck(req.userId!, param(req, 'id'));
    return success(res, check);
  } catch (err) { next(err); }
}

export async function deleteAtsCheck(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await atsService.deleteAtsCheck(req.userId!, param(req, 'id'));
    return success(res, { deleted: true });
  } catch (err) { next(err); }
}
