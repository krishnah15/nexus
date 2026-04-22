import { z } from 'zod';

export const createLearningSchema = z.object({
  body: z.object({
    category: z.enum(['course', 'skill', 'certification', 'book', 'project']),
    title: z.string().min(1).max(300),
    platform: z.string().max(100).optional(),
    url: z.string().url().optional(),
    progress: z.number().int().min(0).max(100).default(0),
    status: z.enum(['not_started', 'in_progress', 'completed', 'paused']).default('not_started'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    targetDate: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});

export const updateLearningSchema = z.object({
  body: z.object({
    category: z.enum(['course', 'skill', 'certification', 'book', 'project']).optional(),
    title: z.string().min(1).max(300).optional(),
    platform: z.string().max(100).optional().nullable(),
    url: z.string().url().optional().nullable(),
    progress: z.number().int().min(0).max(100).optional(),
    status: z.enum(['not_started', 'in_progress', 'completed', 'paused']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    targetDate: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid() }),
});
