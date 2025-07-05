import React from 'react';
import { useScene } from 'src/hooks/useScene';
import { IsoTileArea } from 'src/components/IsoTileArea/IsoTileArea';
import { getColorVariant } from 'src/utils';
import { useColor } from 'src/hooks/useColor';

type Props = ReturnType<typeof useScene>['rectangles'][0];

export const Rectangle = ({ from, to, color: colorId, style, width, radius }: Props) => {
  const color = useColor(colorId);

  // Only apply stroke when style is not 'NONE'
  const strokeProps = style && style !== 'NONE' ? {
    stroke: {
      color: getColorVariant(color.value, 'dark', { grade: 2 }),
      width: width || 1,
      style
    }
  } : {};

  return (
    <IsoTileArea
      from={from}
      to={to}
      fill={color.value}
      cornerRadius={radius || 22}
      {...strokeProps}
    />
  );
};
