import {useMemo} from 'react';
import {getItemByIdOrThrow} from 'src/utils';
import {useScene} from 'src/hooks/useScene';

export const useColor = (colorId?: string) => {
  const { colors } = useScene();

  const color = useMemo(() => {
    if (colorId === undefined) {
        if (colors && colors.length > 0) {
            return colors[0];
        }

        throw new Error('No colors available.');
    }

      if (!colors) {
          throw new Error('No colors available.');
      }

      try {
          return getItemByIdOrThrow(colors, colorId).value;
      } catch (e) {
          // If the color doesn't exist, return the first available color as fallback
      if (colors.length > 0) {
        return colors[0];
      }
      throw new Error('No colors available.');
    }
  }, [colorId, colors]);

  return color;
};
