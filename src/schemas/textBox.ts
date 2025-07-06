import { z } from 'zod';
import { ProjectionOrientationEnum } from 'src/types/common';
import { id, coords, constrainedStrings } from './common';

export const textBoxSchema = z.object({
  id,
  tile: coords,
  content: constrainedStrings.name,
  fontSize: z.number().optional(),
  color: id.optional(),
  orientation: z
    .union([
      z.literal(ProjectionOrientationEnum.X),
      z.literal(ProjectionOrientationEnum.Y)
    ])
    .optional(),
  isBold: z.boolean().optional(),
  isItalic: z.boolean().optional()
});
