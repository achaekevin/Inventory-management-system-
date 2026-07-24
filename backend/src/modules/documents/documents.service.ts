import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import logger from '../../config/logger';

export type DocumentEntityType = 'product' | 'supplier' | 'customer' | 'purchase' | 'sale';

const VALID_ENTITY_TYPES: DocumentEntityType[] = ['product', 'supplier', 'customer', 'purchase', 'sale'];

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export class DocumentService {

  /** Validate entity type */
  validateEntityType(entityType: string): DocumentEntityType {
    if (!VALID_ENTITY_TYPES.includes(entityType as DocumentEntityType)) {
      throw new BadRequestError(`Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
    }
    return entityType as DocumentEntityType;
  }

  /** Ensure the upload directory exists */
  ensureDir(entityType: string, entityId: string): string {
    const dir = path.join(process.cwd(), 'uploads', 'documents', entityType, entityId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /** Upload and persist a document */
  async uploadDocument(data: {
    file: Express.Multer.File;
    entityType: string;
    entityId: string;
    description?: string;
    uploadedBy: string;
  }) {
    const entityType = this.validateEntityType(data.entityType);

    const ext = ALLOWED_MIME_TYPES[data.file.mimetype];
    if (!ext) {
      // Remove temp file
      if (fs.existsSync(data.file.path)) fs.unlinkSync(data.file.path);
      throw new BadRequestError(`Unsupported file type: ${data.file.mimetype}`);
    }

    // Move from temp dir to entity-specific dir
    const dir = this.ensureDir(entityType, data.entityId);
    const storedName = `${uuidv4()}.${ext}`;
    const finalPath = path.join(dir, storedName);
    fs.renameSync(data.file.path, finalPath);

    const relativePath = path.join('uploads', 'documents', entityType, data.entityId, storedName)
      .replace(/\\/g, '/');

    const doc = await prisma.document.create({
      data: {
        entityType,
        entityId: data.entityId,
        fileName: data.file.originalname,
        storedName,
        mimeType: data.file.mimetype,
        size: data.file.size,
        path: relativePath,
        description: data.description || null,
        uploadedBy: data.uploadedBy,
      },
    });

    logger.info(`[Documents] Uploaded ${doc.fileName} (${doc.id}) for ${entityType}/${data.entityId}`);
    return doc;
  }

  /** List all documents for a given entity */
  async listDocuments(entityType: string, entityId: string) {
    this.validateEntityType(entityType);
    return prisma.document.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get a single document by ID */
  async getDocument(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document not found');
    return doc;
  }

  /** Update document description */
  async updateDocument(id: string, description: string) {
    await this.getDocument(id); // ensure exists
    return prisma.document.update({ where: { id }, data: { description } });
  }

  /** Delete document (DB + disk) */
  async deleteDocument(id: string) {
    const doc = await this.getDocument(id);
    const fullPath = path.join(process.cwd(), doc.path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    await prisma.document.delete({ where: { id } });
    logger.info(`[Documents] Deleted ${doc.fileName} (${id})`);
    return { id };
  }

  /** Get aggregated stats across all entities */
  async getStats() {
    const [total, byEntity] = await Promise.all([
      prisma.document.count(),
      prisma.document.groupBy({
        by: ['entityType'],
        _count: { id: true },
        _sum: { size: true },
      }),
    ]);
    return { total, byEntity };
  }
}

export default new DocumentService();
