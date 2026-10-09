import { z } from 'zod';
import { coords, id, constrainedStrings } from './common';

export const connectorStyleOptions = ['SOLID', 'DOTTED', 'DASHED'] as const;

export const connectorVariantOptions = ['ROAD'] as const;

export const anchorSchema = z.object({
  id,
  ref: z
    .object({
      item: id,
      anchor: id,
      tile: coords
    })
    .partial()
});

export const connectorSchema = z.object({
  id,
  description: constrainedStrings.description.optional(),
  color: id.optional(),
  width: z.number().optional(),
  style: z.enum(connectorStyleOptions).optional(),
  showTriangle: z.boolean().optional(),
  height: z.number().int().min(0).max(10).optional(), // Wall height in tiles; 0 is a flat line
  variant: z.enum(connectorVariantOptions).optional(), // Drawn as a road instead of a line
  anchors: z.array(anchorSchema)
});
