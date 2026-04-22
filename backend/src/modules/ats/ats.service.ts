import prisma from '../../config/database';
import { extractTextFromPdf } from '../../utils/pdf-extract';
import { extractSkillsFullText, extractKeywordsFromJD, calculateAtsScore } from '../../utils/skill-extractor';

export async function checkAtsScore(userId: string, data: { documentId: string; jobDescription: string }) {
  const doc = await prisma.document.findFirst({
    where: { id: data.documentId, userId },
  });

  if (!doc) {
    throw Object.assign(new Error('Document not found'), { statusCode: 404 });
  }

  const resumeText = await extractTextFromPdf(doc.filePath);
  const resumeSkills = extractSkillsFullText(resumeText);
  const jdKeywords = extractKeywordsFromJD(data.jobDescription);
  const result = calculateAtsScore(resumeSkills, jdKeywords);

  const atsCheck = await prisma.atsCheck.create({
    data: {
      userId,
      documentId: data.documentId,
      jobDescription: data.jobDescription,
      score: result.score,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
    },
    include: { document: { select: { name: true } } },
  });

  return atsCheck;
}

export async function getAtsHistory(userId: string) {
  return prisma.atsCheck.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { document: { select: { name: true } } },
  });
}

export async function getAtsCheck(userId: string, id: string) {
  const check = await prisma.atsCheck.findFirst({
    where: { id, userId },
    include: { document: { select: { name: true } } },
  });

  if (!check) {
    throw Object.assign(new Error('ATS check not found'), { statusCode: 404 });
  }

  return check;
}

export async function deleteAtsCheck(userId: string, id: string) {
  const check = await prisma.atsCheck.findFirst({ where: { id, userId } });
  if (!check) {
    throw Object.assign(new Error('ATS check not found'), { statusCode: 404 });
  }
  return prisma.atsCheck.delete({ where: { id } });
}
