import chroma from 'chroma-js';
import { Icon, EditorModeEnum, Mode } from 'src/types';
import { v4 as uuid } from 'uuid';

export const generateId = () => {
  return uuid();
};

export const clamp = (num: number, min: number, max: number) => {
  return Math.max(Math.min(num, max), min);
};

export const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const roundToOneDecimalPlace = (num: number) => {
  return Math.round(num * 10) / 10;
};

interface GetColorVariantOpts {
  alpha?: number;
  grade?: number;
}

export const getColorVariant = (
  color: string,
  variant: 'light' | 'dark',
  { alpha = 1, grade = 1 }: GetColorVariantOpts
) => {
  const chromaColor = chroma(color);
  const luminance = chromaColor.luminance();

  switch (variant) {
    case 'light':
      return chromaColor.brighten(grade).alpha(alpha).css();
    case 'dark':
      // If the color is already very dark (luminance < 0.1),
      // brighten it slightly instead of making it darker
      if (luminance < 0.1) {
        return chromaColor
          .brighten(grade * 0.5)
          .alpha(alpha)
          .css();
      }
      return chromaColor.darken(grade).saturate(grade).alpha(alpha).css();
    default:
      return chromaColor.alpha(alpha).css();
  }
};

export const setWindowCursor = (cursor: string) => {
  window.document.body.style.cursor = cursor;
};

export const toPx = (value: number | string) => {
  return `${value}px`;
};

export const categoriseIcons = (icons: Icon[]) => {
  const categories: {
    name?: string;
    icons: Icon[];
    subcategories?: { id: string; isExpanded: boolean }[];
  }[] = [];

  // First pass: group by collection
  icons.forEach((icon) => {
    const collection = categories.find((cat) => {
      return cat.name === icon.collection;
    });

    if (!collection) {
      categories.push({
        name: icon.collection,
        icons: [icon],
        subcategories: []
      });
    } else {
      collection.icons.push(icon);
    }
  });

  // Second pass: identify subcategories within each collection
  return categories.map((category) => {
    // Initialize subcategories map
    const subcategoriesMap = new Map<string, boolean>();

    // Identify unique subcategories
    category.icons.forEach((icon) => {
      if (icon.subcategory && !subcategoriesMap.has(icon.subcategory)) {
        subcategoriesMap.set(icon.subcategory, true);
      }
    });

    // Create a new category object with subcategories
    const result = { ...category };

    // Convert map to array of subcategory states
    if (subcategoriesMap.size > 0) {
      result.subcategories = Array.from(subcategoriesMap.keys()).map((id) => {
        return {
          id,
          isExpanded: false
        };
      });
    }

    return result;
  });
};

export const getStartingMode = (
  editorMode: keyof typeof EditorModeEnum
): Mode => {
  switch (editorMode) {
    case 'EDITABLE':
      return { type: 'CURSOR', showCursor: true, mousedownItem: null };
    case 'EXPLORABLE_READONLY':
      return { type: 'PAN', showCursor: false };
    case 'NON_INTERACTIVE':
      return { type: 'INTERACTIONS_DISABLED', showCursor: false };
    default:
      throw new Error('Invalid editor mode.');
  }
};

export function getItemByIdOrThrow<T extends { id: string }>(
  values: T[],
  id: string
): { value: T; index: number } {
  const index = values.findIndex((val) => {
    return val.id === id;
  });

  if (index === -1) {
    throw new Error(`Item with id "${id}" not found.`);
  }

  return { value: values[index], index };
}

export function getItemByIndexOrThrow<T>(items: T[], index: number): T {
  const item = items[index];

  if (!item) {
    throw new Error(`Item with index "${index}" not found.`);
  }

  return item;
}
