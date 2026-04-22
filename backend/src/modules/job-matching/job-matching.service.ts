import prisma from '../../config/database';
import { extractTextFromPdf } from '../../utils/pdf-extract';
import { extractSkillsFromSection, calculateJobMatch } from '../../utils/skill-extractor';
import { searchJobs, isJobApiConfigured, getJobCountsForRoles, type ExternalJob } from '../../services/job-api.service';
import { suggestRoles } from '../../utils/role-suggester';

export async function extractAndSaveSkillProfile(userId: string, documentId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!doc) {
    throw Object.assign(new Error('Document not found'), { statusCode: 404 });
  }

  const rawText = await extractTextFromPdf(doc.filePath);
  const skills = extractSkillsFromSection(rawText);

  if (skills.length === 0) {
    throw Object.assign(
      new Error('No skills could be extracted from the resume. Make sure your resume has a clear "Skills" section.'),
      { statusCode: 422 }
    );
  }

  const profile = await prisma.skillProfile.upsert({
    where: { userId },
    create: {
      userId,
      documentId,
      skills,
      rawText: rawText.substring(0, 5000),
    },
    update: {
      documentId,
      skills,
      rawText: rawText.substring(0, 5000),
      extractedAt: new Date(),
    },
    include: { document: { select: { name: true } } },
  });

  return profile;
}

export async function getSkillProfile(userId: string) {
  return prisma.skillProfile.findUnique({
    where: { userId },
    include: { document: { select: { name: true } } },
  });
}

export async function getSuggestedRoles(
  userId: string,
  country = 'in'
): Promise<{ role: string; count: number }[]> {
  const profile = await prisma.skillProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw Object.assign(new Error('No skill profile found. Extract skills first.'), { statusCode: 400 });
  }

  // Generate ~8-10 candidate roles from skills
  const candidates = suggestRoles(profile.skills);

  if (!isJobApiConfigured()) {
    // No API key — return roles without counts
    return candidates.map((role) => ({ role, count: 0 }));
  }

  // Fetch real job counts for all candidates in parallel
  const ranked = await getJobCountsForRoles(candidates, country);

  // Return top 5 with the most jobs
  return ranked.filter((r) => r.count > 0).slice(0, 5);
}

export async function deleteSkillProfile(userId: string) {
  const profile = await prisma.skillProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw Object.assign(new Error('No skill profile found'), { statusCode: 404 });
  }
  return prisma.skillProfile.delete({ where: { userId } });
}

export interface MatchedJob extends ExternalJob {
  matchPercentage: number;
  matchedSkills: string[];
}

// Skills that are too generic for searching but fine for matching
const GENERIC_SEARCH_SKILLS = new Set([
  'git', 'github', 'sql', 'html', 'html5', 'css', 'css3', 'bash',
  'linux', 'crud', 'ssr',
]);

export async function getMatchingJobs(
  userId: string,
  query: { location?: string; country?: string; page?: number; minMatch?: number }
): Promise<{ jobs: MatchedJob[]; apiConfigured: boolean; totalSkills: number }> {
  const profile = await prisma.skillProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw Object.assign(new Error('No skill profile found. Extract skills from your resume first.'), { statusCode: 400 });
  }

  if (!isJobApiConfigured()) {
    return { jobs: [], apiConfigured: false, totalSkills: profile.skills.length };
  }

  const minMatch = query.minMatch || 30;

  // Pick 3-4 strong skills for search (not generic ones)
  // Adzuna works best with fewer, more specific terms
  const searchSkills = profile.skills
    .filter((s) => !GENERIC_SEARCH_SKILLS.has(s))
    .slice(0, 4);

  const externalJobs = await searchJobs({
    keywords: searchSkills,
    location: query.location,
    country: query.country,
    page: query.page || 1,
  });

  // Calculate match: how many of user's skills appear in the job description
  const matchedJobs: MatchedJob[] = externalJobs
    .map((job) => {
      const { matchPercentage, matchedSkills } = calculateJobMatch(profile.skills, `${job.title} ${job.description}`);
      return { ...job, matchPercentage, matchedSkills };
    })
    .filter((job) => job.matchPercentage >= minMatch)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return { jobs: matchedJobs, apiConfigured: true, totalSkills: profile.skills.length };
}
