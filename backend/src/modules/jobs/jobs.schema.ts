import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    company: z.string().min(1).max(200),
    position: z.string().min(1).max(200),
    location: z.string().max(200).optional(),
    jobUrl: z.string().url().optional(),
    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),
    salaryCurrency: z.string().max(3).default('USD'),
    status: z.enum(['saved', 'applied', 'screening', 'interview', 'technical', 'offer', 'rejected', 'withdrawn', 'accepted']).default('saved'),
    appliedDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    scrapedData: z.any().optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    company: z.string().min(1).max(200).optional(),
    position: z.string().min(1).max(200).optional(),
    location: z.string().max(200).optional().nullable(),
    jobUrl: z.string().url().optional().nullable(),
    salaryMin: z.number().int().positive().optional().nullable(),
    salaryMax: z.number().int().positive().optional().nullable(),
    salaryCurrency: z.string().max(3).optional(),
    status: z.enum(['saved', 'applied', 'screening', 'interview', 'technical', 'offer', 'rejected', 'withdrawn', 'accepted']).optional(),
    appliedDate: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const scrapeJobSchema = z.object({
  body: z.object({
    url: z.string().url(),
  }),
});

export const jobQuerySchema = z.object({
  query: z.object({
    page: z.string().default('1'),
    limit: z.string().default('20'),
    status: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['created_at', 'applied_date', 'company', 'status']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});
