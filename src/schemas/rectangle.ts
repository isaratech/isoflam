import {z} from 'zod';
import {coords, id} from './common';

export const rectangleStyleOptions = ['NONE', 'SOLID', 'DASHED'] as const;

export const rectangleSchema = z.object({
  id,
  color: id.optional(),
  from: coords,
  to: coords,
  style: z.enum(rectangleStyleOptions).optional(),
    width: z.number().min(0).optional(),
    radius: z.number().min(0).optional(),
    imageData: z.string().optional(), // Base64 encoded image data
    imageName: z.string().optional(), // Original filename for reference
    mirrorHorizontal: z.boolean().optional(), // Horizontal mirroring for images
    mirrorVertical: z.boolean().optional(), // Vertical mirroring for images
    rotationAngle: z.number().optional() // Rotation angle in degrees (0, 90, 180, 270)
});
