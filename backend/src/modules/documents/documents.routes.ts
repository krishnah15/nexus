import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as controller from './documents.controller';
import { authenticate } from '../../middleware/auth';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();
router.use(authenticate);

router.get('/', controller.getDocuments);
router.post('/', upload.single('file'), controller.uploadDocument);
router.get('/:id/download', controller.downloadDocument);
router.delete('/:id', controller.deleteDocument);

export default router;
