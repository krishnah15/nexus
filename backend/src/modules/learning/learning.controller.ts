import { Response, NextFunction } from 'express';
import { AuthRequest, param } from '../../middleware/auth';
import * as learningService from './learning.service';
import { success, paginated } from '../../utils/api-response';

export async function getItems(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await learningService.getItems(req.userId!, req.query);
    return paginated(res, result.items, result.total, result.page, result.limit);
  } catch (err) { next(err); }
}

export async function getItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await learningService.getItem(req.userId!, param(req, 'id'));
    return success(res, item);
  } catch (err) { next(err); }
}

export async function createItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await learningService.createItem(req.userId!, req.body);
    return success(res, item, 201);
  } catch (err) { next(err); }
}

export async function updateItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await learningService.updateItem(req.userId!, param(req, 'id'), req.body);
    return success(res, item);
  } catch (err) { next(err); }
}

export async function deleteItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await learningService.deleteItem(req.userId!, param(req, 'id'));
    return success(res, { message: 'Item deleted' });
  } catch (err) { next(err); }
}
