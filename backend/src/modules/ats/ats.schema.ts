import { z } from 'zod';

export const atsCheckSchema = z.object({
  body: z.object({
    documentId: z.string().uuid(),
    jobDescription: z.string().min(50, 'Job description must be at least 50 characters').max(10000),
  }),
});
