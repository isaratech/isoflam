import { z } from 'zod';
import { id, coords } from './common';

export const rectangleStyleOptions = ['SOLID', 'DOTTED', 'DASHED'] as const;

export const rectangleSchema = z.object({
  id,
  color: id.optional(),
  from: coords,
  to: coords,
  style: z.enum(rectangleStyleOptions).optional()
});
