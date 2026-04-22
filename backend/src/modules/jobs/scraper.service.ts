import * as cheerio from 'cheerio';

export interface ScrapedJob {
  company?: string;
  position?: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  raw?: Record<string, string>;
}

export async function scrapeJobUrl(url: string): Promise<ScrapedJob> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw Object.assign(new Error('Failed to fetch job posting'), { statusCode: 422 });
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const result: ScrapedJob = { raw: {} };

  // Try JSON-LD structured data first (most reliable)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      const job = data['@type'] === 'JobPosting' ? data : data['@graph']?.find((d: any) => d['@type'] === 'JobPosting');
      if (job) {
        result.position = job.title;
        result.company = job.hiringOrganization?.name;
        result.location = job.jobLocation?.address?.addressLocality || job.jobLocation?.name;
        result.description = job.description;
        if (job.baseSalary) {
          const salary = job.baseSalary;
          result.salary = salary.value ? `${salary.currency || ''} ${salary.value.minValue || salary.value}-${salary.value.maxValue || ''}` : undefined;
        }
      }
    } catch { /* ignore parse errors */ }
  });

  // Fallback: meta tags
  if (!result.position) {
    result.position = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  }
  if (!result.description) {
    result.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
  }
  if (!result.company) {
    result.company = $('meta[property="og:site_name"]').attr('content') || '';
  }

  // Trim description to reasonable length
  if (result.description && result.description.length > 2000) {
    result.description = result.description.substring(0, 2000) + '...';
  }

  return result;
}
