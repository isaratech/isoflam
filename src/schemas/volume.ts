import {z} from 'zod';
import {coords, id} from './common';

export const volumeStyleOptions = ['NONE', 'SOLID', 'DASHED'] as const;

export const volumeSchema = z.object({
  id,
  color: id.optional(),
  from: coords,
  to: coords,
  height: z.number().min(0).default(1), // Height in tile units for the volume
  style: z.enum(volumeStyleOptions).optional(),
  width: z.number().min(0).optional(),
  imageData: z.string().optional(), // Base64 encoded image data
  imageName: z.string().optional(), // Original filename for reference
  mirrorHorizontal: z.boolean().optional(), // Horizontal mirroring for images
  mirrorVertical: z.boolean().optional(), // Vertical mirroring for images
  rotationAngle: z.number().optional(), // Rotation angle in degrees (0, 90, 180, 270)
  isometric: z.boolean().optional() // Whether to use isometric projection for images (default: true)
});