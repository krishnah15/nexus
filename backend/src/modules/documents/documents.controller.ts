import { Response, NextFunction } from 'express';
import { AuthRequest, param } from '../../middleware/auth';
import * as documentsService from './documents.service';
import { success } from '../../utils/api-response';

export async function getDocuments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const docs = await documentsService.getDocuments(req.userId!, req.query);
    return success(res, docs);
  } catch (err) { next(err); }
}

export async function uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    }
    const doc = await documentsService.uploadDocument(req.userId!, req.file, req.body);
    return success(res, doc, 201);
  } catch (err) { next(err); }
}

export async function downloadDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doc = await documentsService.getDocument(req.userId!, param(req, 'id'));
    return res.download(doc.filePath, doc.name);
  } catch (err) { next(err); }
}

export async function deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await documentsService.deleteDocument(req.userId!, param(req, 'id'));
    return success(res, { message: 'Document deleted' });
  } catch (err) { next(err); }
}
