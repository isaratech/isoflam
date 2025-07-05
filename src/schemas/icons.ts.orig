import { z } from 'zod';
import { id, constrainedStrings } from './common';

export const iconSchema = z.object({
  id,
  name: constrainedStrings.name,
  url: z.string(),
  collection: constrainedStrings.name.optional(),
  subcategory: constrainedStrings.name.optional(),
  isIsometric: z.boolean().optional(),
  scaleFactor: z.number().min(0.1).max(5).optional().default(1),
  colorizable: z.boolean().optional().default(true)
});

export const iconsSchema = z.array(iconSchema);
