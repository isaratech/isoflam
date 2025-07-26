import { z } from 'zod';
import { coords, id, constrainedStrings } from './common';

export const roadStyleOptions = ['SOLID', 'DOTTED', 'DASHED'] as const;

export const roadAnchorSchema = z.object({
  id,
  ref: z
    .object({
      item: id,
      anchor: id,
      tile: coords
    })
    .partial()
});

export const roadSchema = z.object({
  id,
  description: constrainedStrings.description.optional(),
  color: id.optional(),
  width: z.number().min(2).default(2), // Minimum width is 2 as per requirements
  style: z.enum(roadStyleOptions).optional(),
  anchors: z.array(roadAnchorSchema)
});