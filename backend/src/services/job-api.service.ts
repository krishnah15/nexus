import { env } from '../config/env';

export interface ExternalJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  postedDate?: string;
}

// Simple in-memory cache to avoid duplicate API calls
const cache = new Map<string, { data: ExternalJob[]; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(keywords: string[], location?: string): string {
  return `${keywords.sort().join(',')}|${location || ''}`;
}

export async function searchJobs(params: {
  keywords: string[];
  location?: string;
  country?: string;
  page?: number;
}): Promise<ExternalJob[]> {
  const { keywords, location, country, page = 1 } = params;

  if (keywords.length === 0) return [];

  const cacheKey = getCacheKey(keywords, location) + `|p${page}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  let jobs: ExternalJob[] = [];

  // Try Adzuna first
  if ((env as any).ADZUNA_APP_ID && (env as any).ADZUNA_APP_KEY) {
    jobs = await searchAdzuna(keywords, location, country, page);
  }
  // Fallback to JSearch / RapidAPI
  else if ((env as any).RAPIDAPI_KEY) {
    jobs = await searchJSearch(keywords, location, page);
  }
  // No API keys configured - return empty with a helpful message
  else {
    return [];
  }

  cache.set(cacheKey, { data: jobs, expiry: Date.now() + CACHE_TTL });
  return jobs;
}

async function searchAdzuna(keywords: string[], location?: string, countryCode?: string, page = 1): Promise<ExternalJob[]> {
  const query = keywords.slice(0, 4).join(' ');
  const country = countryCode || 'in'; // default to India
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${(env as any).ADZUNA_APP_ID}&app_key=${(env as any).ADZUNA_APP_KEY}&what=${encodeURIComponent(query)}${location ? `&where=${encodeURIComponent(location)}` : ''}&results_per_page=20&content-type=application/json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data: any = await res.json();

    return (data.results || []).map((job: any) => ({
      title: job.title || '',
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || '',
      description: job.description || '',
      url: job.redirect_url || '',
      salaryMin: job.salary_min ? Math.round(job.salary_min) : undefined,
      salaryMax: job.salary_max ? Math.round(job.salary_max) : undefined,
      postedDate: job.created || undefined,
    }));
  } catch {
    return [];
  }
}

async function searchJSearch(keywords: string[], location?: string, page = 1): Promise<ExternalJob[]> {
  const query = keywords.slice(0, 6).join(' ') + (location ? ` in ${location}` : '');
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': (env as any).RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    if (!res.ok) return [];
    const data: any = await res.json();

    return (data.data || []).map((job: any) => ({
      title: job.job_title || '',
      company: job.employer_name || 'Unknown',
      location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', '),
      description: job.job_description || '',
      url: job.job_apply_link || job.job_google_link || '',
      salaryMin: job.job_min_salary ? Math.round(job.job_min_salary) : undefined,
      salaryMax: job.job_max_salary ? Math.round(job.job_max_salary) : undefined,
      postedDate: job.job_posted_at_datetime_utc || undefined,
    }));
  } catch {
    return [];
  }
}

export function isJobApiConfigured(): boolean {
  return !!((env as any).ADZUNA_APP_ID && (env as any).ADZUNA_APP_KEY) || !!(env as any).RAPIDAPI_KEY;
}

// Cache for job counts (longer TTL since counts don't change fast)
const countCache = new Map<string, { count: number; expiry: number }>();
const COUNT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get job count for a role title from Adzuna.
 * Uses only the count field (no full results fetched).
 */
export async function getJobCount(role: string, countryCode = 'in'): Promise<number> {
  if (!(env as any).ADZUNA_APP_ID || !(env as any).ADZUNA_APP_KEY) return 0;

  const cacheKey = `count|${role}|${countryCode}`;
  const cached = countCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) return cached.count;

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${(env as any).ADZUNA_APP_ID}&app_key=${(env as any).ADZUNA_APP_KEY}&what=${encodeURIComponent(role)}&results_per_page=1&content-type=application/json`;
    const res = await fetch(url);
    if (!res.ok) return 0;
    const data: any = await res.json();
    const count = data.count || 0;
    countCache.set(cacheKey, { count, expiry: Date.now() + COUNT_CACHE_TTL });
    return count;
  } catch {
    return 0;
  }
}

/**
 * Get job counts for multiple roles in parallel.
 */
export async function getJobCountsForRoles(
  roles: string[],
  countryCode = 'in'
): Promise<{ role: string; count: number }[]> {
  const results = await Promise.all(
    roles.map(async (role) => ({
      role,
      count: await getJobCount(role, countryCode),
    }))
  );
  return results.sort((a, b) => b.count - a.count);
}
