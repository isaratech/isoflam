import { z } from 'zod';
import { id, constrainedStrings, coords } from './common';
import { rectangleSchema } from './rectangle';
import { connectorSchema } from './connector';
import { textBoxSchema } from './textBox';
import { volumeSchema } from './volume';

export const viewItemSchema = z.object({
  id,
  tile: coords,
  labelHeight: z.number().optional(),
  scaleFactor: z.number().min(0.1).optional(),
  color: id.optional(),
  mirrorHorizontal: z.boolean().optional().default(false),
  mirrorVertical: z.boolean().optional().default(false)
});

export const viewSchema = z.object({
  id,
  lastUpdated: z.string().datetime().optional(),
  name: constrainedStrings.name,
  description: constrainedStrings.description.optional(),
  items: z.array(viewItemSchema),
  rectangles: z.array(rectangleSchema).optional(),
  volumes: z.array(volumeSchema).optional(),
  connectors: z.array(connectorSchema).optional(),
  textBoxes: z.array(textBoxSchema).optional()
});

export const viewsSchema = z.array(viewSchema);
