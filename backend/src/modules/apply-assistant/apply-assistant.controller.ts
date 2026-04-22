import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as applyService from './apply-assistant.service';
import { isAiConfigured } from '../../services/ai.service';
import { success } from '../../utils/api-response';

export async function prepareApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await applyService.prepareApplication(req.userId!, req.body);
    return success(res, result, 201);
  } catch (err) { next(err); }
}

export async function getCoverLetter(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const letter = await applyService.getCoverLetter(req.userId!, req.body);
    return success(res, { coverLetter: letter });
  } catch (err) { next(err); }
}

export async function getAiStatus(_req: AuthRequest, res: Response) {
  return success(res, { configured: isAiConfigured() });
}
