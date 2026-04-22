import { z } from 'zod';

export const createCountrySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    priority: z.number().int().min(0).default(0),
    status: z.enum(['researching', 'preparing', 'applied', 'approved', 'moved']).default('researching'),
    notes: z.string().optional(),
  }),
});

export const updateCountrySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    priority: z.number().int().min(0).optional(),
    status: z.enum(['researching', 'preparing', 'applied', 'approved', 'moved']).optional(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const createPathwaySchema = z.object({
  body: z.object({
    type: z.string().min(1).max(100),
    requirements: z.any().optional(),
    timeline: z.string().max(200).optional(),
    costEstimate: z.string().max(200).optional(),
    status: z.enum(['researching', 'preparing', 'applied', 'approved']).default('researching'),
    notes: z.string().optional(),
  }),
  params: z.object({ countryId: z.string().uuid() }),
});

export const updatePathwaySchema = z.object({
  body: z.object({
    type: z.string().min(1).max(100).optional(),
    requirements: z.any().optional(),
    timeline: z.string().max(200).optional().nullable(),
    costEstimate: z.string().max(200).optional().nullable(),
    status: z.enum(['researching', 'preparing', 'applied', 'approved']).optional(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({ countryId: z.string().uuid(), id: z.string().uuid() }),
});
