import { z } from 'zod';
import { id, coords } from './common';
import { rectangleStyleOptions } from './rectangle';

export const volumeSchema = z.object({
  id,
  color: id.optional(),
  from: coords,
  to: coords,
  style: z.enum(rectangleStyleOptions).optional(),
  width: z.number().min(1).optional(),
  radius: z.number().min(0).optional(),
  height: z.number().min(1).default(1),
  hasRoof: z.boolean().default(true)
});
