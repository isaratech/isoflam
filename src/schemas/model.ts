import {z} from 'zod';
import {INITIAL_DATA} from '../config';
import {constrainedStrings} from './common';
import {modelItemsSchema} from './modelItems';
import {viewsSchema} from './views';
import {iconsSchema} from './icons';
import {colorsSchema} from './colors';

export const modelSchema = z
  .object({
    version: z.string().optional(),
    title: constrainedStrings.name,
    description: constrainedStrings.description.optional(),
    items: modelItemsSchema,
    views: viewsSchema,
      icons: iconsSchema.optional(),
      colors: colorsSchema.optional()
  })
    .transform((model) => {
        // Ensure icons and colors are always present by using defaults when missing
        return {
            ...model,
            icons: model.icons || INITIAL_DATA.icons,
            colors: model.colors || INITIAL_DATA.colors
        };
  });
