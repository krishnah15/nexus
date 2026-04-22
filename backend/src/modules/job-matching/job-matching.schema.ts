import { z } from 'zod';

export const extractSkillsSchema = z.object({
  body: z.object({
    documentId: z.string().uuid(),
  }),
});
