import { z } from 'zod';

export const createDsaSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300),
    platform: z.string().max(50).optional(),
    url: z.string().url().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    topic: z.string().max(100).optional(),
    status: z.enum(['todo', 'attempted', 'solved', 'review']).default('todo'),
    timeTakenMin: z.number().int().positive().optional(),
    notes: z.string().optional(),
    solvedAt: z.string().datetime().optional(),
  }),
});

export const updateDsaSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300).optional(),
    platform: z.string().max(50).optional().nullable(),
    url: z.string().url().optional().nullable(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional().nullable(),
    topic: z.string().max(100).optional().nullable(),
    status: z.enum(['todo', 'attempted', 'solved', 'review']).optional(),
    timeTakenMin: z.number().int().positive().optional().nullable(),
    notes: z.string().optional().nullable(),
    solvedAt: z.string().datetime().optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid() }),
});
