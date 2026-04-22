import prisma from '../../config/database';
import fs from 'fs';
import path from 'path';

export async function getDocuments(userId: string, query: any) {
  const where: any = { userId };
  if (query.country_id) where.countryId = query.country_id;
  if (query.category) where.category = query.category;

  return prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function uploadDocument(userId: string, file: Express.Multer.File, body: any) {
  return prisma.document.create({
    data: {
      userId,
      countryId: body.countryId || null,
      name: body.name || file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      category: body.category || null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
    },
  });
}

export async function getDocument(userId: string, id: string) {
  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) throw Object.assign(new Error('Document not found'), { statusCode: 404 });
  return doc;
}

export async function deleteDocument(userId: string, id: string) {
  const doc = await getDocument(userId, id);
  // Delete file from disk
  try {
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }
  } catch { /* ignore file deletion errors */ }
  return prisma.document.delete({ where: { id } });
}
