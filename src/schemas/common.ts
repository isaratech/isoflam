import { z } from 'zod';

export const coords = z.object({
  x: z.number(),
  y: z.number()
});

export const id = z.string();
export const color = z.string();

export const constrainedStrings = {
  name: z.string(),
  description: z.string()
};
