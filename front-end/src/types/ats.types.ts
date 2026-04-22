export interface AtsCheckResult {
  id: string;
  documentId: string;
  jobDescription: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  createdAt: string;
  document: { name: string };
}

export interface SkillProfile {
  id: string;
  documentId: string;
  skills: string[];
  extractedAt: string;
  document: { name: string };
}

export interface MatchedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  postedDate?: string;
  matchPercentage: number;
  matchedSkills: string[];
}

export interface MatchingJobsResponse {
  jobs: MatchedJob[];
  apiConfigured: boolean;
  totalSkills: number;
}
