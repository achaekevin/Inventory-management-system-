import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import documentsController from './documents.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from './documents.service';

// ─── Multer config ───────────────────────────────────────────────────────────

const tempStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
    const fs = require('fs');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: tempStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ─── Router ──────────────────────────────────────────────────────────────────

const router = Router();
router.use(authenticate);

// Stats
router.get('/stats', authorize('products', 'read'), documentsController.stats.bind(documentsController));

// Upload
router.post(
  '/upload',
  authorize('products', 'create'),
  upload.single('file'),
  documentsController.upload.bind(documentsController)
);

// List for entity
router.get('/:entityType/:entityId', authorize('products', 'read'), documentsController.list.bind(documentsController));

// Update description
router.patch('/:id', authorize('products', 'update'), documentsController.update.bind(documentsController));

// Delete
router.delete('/:id', authorize('products', 'delete'), documentsController.delete.bind(documentsController));

export default router;
