import { z } from 'zod';

export const prepareApplicationSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1),
    company: z.string().min(1),
    jobDescription: z.string().min(30).max(10000),
    jobUrl: z.string().url().optional(),
    location: z.string().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
  }),
});

export const coverLetterSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1),
    company: z.string().min(1),
    jobDescription: z.string().min(30).max(10000),
  }),
});
