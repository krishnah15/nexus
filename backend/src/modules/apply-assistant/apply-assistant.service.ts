import prisma from '../../config/database';
import { extractTextFromPdf } from '../../utils/pdf-extract';
import { extractSkillsFullText, extractKeywordsFromJD, calculateAtsScore } from '../../utils/skill-extractor';
import { generateCoverLetter, generateResumeSuggestions, generateScreeningAnswers, isAiConfigured } from '../../services/ai.service';

async function getResumeData(userId: string) {
  // Get the user's skill profile to find the resume document
  const profile = await prisma.skillProfile.findUnique({
    where: { userId },
    include: { document: true },
  });

  if (!profile) {
    throw Object.assign(new Error('No skill profile found. Extract skills from your resume first.'), { statusCode: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const resumeText = await extractTextFromPdf(profile.document.filePath);

  return { resumeText, skills: profile.skills, userName: user?.name || 'Applicant' };
}

export interface ApplicationPrep {
  atsScore: {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  coverLetter: string | null;
  resumeSuggestions: {
    keywordsToAdd: string[];
    bulletSuggestions: string[];
    summary: string;
  } | null;
  screeningAnswers: { question: string; answer: string }[] | null;
  savedJobId: string | null;
  aiConfigured: boolean;
}

/**
 * Full application prep: ATS check + AI cover letter + resume suggestions + screening answers + save to tracker
 */
export async function prepareApplication(
  userId: string,
  data: {
    jobTitle: string;
    company: string;
    jobDescription: string;
    jobUrl?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
  }
): Promise<ApplicationPrep> {
  const { resumeText, skills, userName } = await getResumeData(userId);

  // 1. ATS Score (always runs — no AI needed)
  const resumeSkills = extractSkillsFullText(resumeText);
  const jdKeywords = extractKeywordsFromJD(data.jobDescription);
  const ats = calculateAtsScore(resumeSkills, jdKeywords);

  // 2. Save to job tracker
  const savedJob = await prisma.jobApplication.create({
    data: {
      userId,
      company: data.company,
      position: data.jobTitle,
      location: data.location,
      jobUrl: data.jobUrl,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      status: 'saved',
      notes: `ATS Score: ${ats.score}%`,
    },
  });

  // 3. AI features (if configured)
  if (!isAiConfigured()) {
    return {
      atsScore: { score: ats.score, matchedKeywords: ats.matchedKeywords, missingKeywords: ats.missingKeywords },
      coverLetter: null,
      resumeSuggestions: null,
      screeningAnswers: null,
      savedJobId: savedJob.id,
      aiConfigured: false,
    };
  }

  // Run AI tasks in parallel
  const [coverLetter, resumeSuggestions, screeningAnswers] = await Promise.all([
    generateCoverLetter({
      resumeText,
      jobDescription: data.jobDescription,
      jobTitle: data.jobTitle,
      company: data.company,
      userName,
    }).catch(() => null),
    generateResumeSuggestions({
      resumeText,
      jobDescription: data.jobDescription,
      matchedSkills: ats.matchedKeywords,
      missingSkills: ats.missingKeywords,
    }).catch(() => null),
    generateScreeningAnswers({
      resumeText,
      jobTitle: data.jobTitle,
      company: data.company,
    }).catch(() => null),
  ]);

  // Update the job with the cover letter
  if (coverLetter) {
    await prisma.jobApplication.update({
      where: { id: savedJob.id },
      data: { notes: `ATS Score: ${ats.score}%\n\n---COVER LETTER---\n${coverLetter}` },
    });
  }

  return {
    atsScore: { score: ats.score, matchedKeywords: ats.matchedKeywords, missingKeywords: ats.missingKeywords },
    coverLetter,
    resumeSuggestions,
    screeningAnswers,
    savedJobId: savedJob.id,
    aiConfigured: true,
  };
}

/**
 * Generate just a cover letter (lighter endpoint)
 */
export async function getCoverLetter(
  userId: string,
  data: { jobTitle: string; company: string; jobDescription: string }
): Promise<string> {
  if (!isAiConfigured()) {
    throw Object.assign(new Error('ANTHROPIC_API_KEY not configured'), { statusCode: 400 });
  }

  const { resumeText, userName } = await getResumeData(userId);
  return generateCoverLetter({
    resumeText,
    jobDescription: data.jobDescription,
    jobTitle: data.jobTitle,
    company: data.company,
    userName,
  });
}
