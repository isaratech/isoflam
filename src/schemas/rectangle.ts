import { z } from 'zod';
import { id, coords } from './common';

export const rectangleStyleOptions = ['NONE', 'SOLID', 'DASHED'] as const;

export const rectangleSchema = z.object({
  id,
  color: id.optional(),
  from: coords,
  to: coords,
  style: z.enum(rectangleStyleOptions).optional(),
  width: z.number().min(1).optional(),
  radius: z.number().min(0).optional()
});
