import { z } from 'zod';
import { id } from './common';

export const colorSchema = z.object({
  id,
  value: z.string()
});

export const colorsSchema = z.array(colorSchema);
