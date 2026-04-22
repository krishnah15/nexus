import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  body: z.object({
    name: z.string().max(200).optional(),
    countryId: z.string().uuid().optional(),
    category: z.string().max(100).optional(),
    expiryDate: z.string().datetime().optional(),
  }),
});
