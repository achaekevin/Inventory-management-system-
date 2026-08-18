import { Response, NextFunction } from 'express';
import documentService from './documents.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';
import { BadRequestError } from '../../common/errors/AppError';

export class DocumentsController {

  /** POST /api/documents/upload */
  async upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file provided');

      const { entityType, entityId, description } = req.body;
      if (!entityType || !entityId) {
        throw new BadRequestError('entityType and entityId are required');
      }

      const doc = await documentService.uploadDocument({
        file: req.file,
        entityType,
        entityId,
        description,
        uploadedBy: req.user!.id,
      });

      ResponseHandler.success(res, doc, 'Document uploaded successfully', 201);
    } catch (err) { next(err); }
  }

  /** GET /api/documents/:entityType/:entityId */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const docs = await documentService.listDocuments(entityType as string, entityId as string);
      ResponseHandler.success(res, docs);
    } catch (err) { next(err); }
  }

  /** PATCH /api/documents/:id */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description } = req.body;
      const doc = await documentService.updateDocument(req.params.id as string, description || '');
      ResponseHandler.success(res, doc, 'Document updated');
    } catch (err) { next(err); }
  }

  /** DELETE /api/documents/:id */
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await documentService.deleteDocument(req.params.id as string);
      ResponseHandler.success(res, result, 'Document deleted');
    } catch (err) { next(err); }
  }

  /** GET /api/documents/stats */
  async stats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await documentService.getStats();
      ResponseHandler.success(res, data);
    } catch (err) { next(err); }
  }
}

export default new DocumentsController();
