export interface JobApplication {
  id: string;
  company: string;
  position: string;
  location?: string;
  jobUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  status: string;
  appliedDate?: string;
  notes?: string;
  resumeUrl?: string;
  scrapedData?: Record<string, unknown>;
  interviews: JobInterview[];
  createdAt: string;
  updatedAt: string;
}

export interface JobInterview {
  id: string;
  jobId: string;
  round: string;
  scheduledAt?: string;
  notes?: string;
  outcome: string;
  createdAt: string;
}

export interface ScrapedJobData {
  company?: string;
  position?: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
}
