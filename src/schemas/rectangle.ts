import { z } from 'zod';
import { coords, id } from './common';

export const rectangleStyleOptions = ['NONE', 'SOLID', 'DASHED'] as const;

export const rectangleTextureOptions = ['ROAD'] as const;

export const buildingSchema = z.object({
  roof: z.enum(['FLAT', 'GABLE', 'HIP']).optional(), // Default GABLE
  roofHeight: z.number().min(0).max(5).optional(), // In tiles, default 1
  roofColor: id.optional(),
  windows: z.boolean().optional(), // Default true
  door: z.boolean().optional(), // Default true
  doorFacade: z.enum(['LEFT', 'RIGHT']).optional() // Default RIGHT
});

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
  rotationAngle: z.number().optional(), // Rotation angle in degrees (0, 90, 180, 270)
  isometric: z.boolean().optional(), // Whether to use isometric projection for images (default: true)
  height: z.number().int().min(0).max(20).optional(), // Extrusion in tiles; > 0 makes the rectangle a volume
  roof: z.boolean().optional(), // Volume only: closed box if true, otherwise only the two back walls
  texture: z.enum(rectangleTextureOptions).optional(), // Drawn pattern replacing the plain fill
  building: buildingSchema.optional() // Volume only: drawn as a building (roof, windows, door)
});
