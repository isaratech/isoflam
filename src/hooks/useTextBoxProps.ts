import { useMemo } from 'react';
import { TextBox } from 'src/types';
import {
  UNPROJECTED_TILE_SIZE,
  DEFAULT_FONT_FAMILY,
  TEXTBOX_DEFAULTS,
  TEXTBOX_PADDING
} from 'src/config';
import { useColor } from 'src/hooks/useColor';

export const useTextBoxProps = (textBox: TextBox) => {
  const color = useColor(textBox.color);

  const fontProps = useMemo(() => {
    return {
      fontSize:
        UNPROJECTED_TILE_SIZE * (textBox.fontSize ?? TEXTBOX_DEFAULTS.fontSize),
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: textBox.isBold ?? TEXTBOX_DEFAULTS.isBold ? 'bold' : 'normal',
      fontStyle: textBox.isItalic ?? TEXTBOX_DEFAULTS.isItalic ? 'italic' : 'normal',
      color: color.value
    };
  }, [textBox.fontSize, textBox.isBold, textBox.isItalic, color.value]);

  const paddingX = useMemo(() => {
    return UNPROJECTED_TILE_SIZE * TEXTBOX_PADDING;
  }, []);

  return { paddingX, fontProps };
};