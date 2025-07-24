import React from 'react';
import {useScene} from 'src/hooks/useScene';
import {IsoTileVolume} from 'src/components/IsoTileVolume/IsoTileVolume';
import {getColorVariant} from 'src/utils';
import {useColor} from 'src/hooks/useColor';

type Props = ReturnType<typeof useScene>['volumes'][0];

export const Volume = ({from, to, height, color: colorId, style, width, radius, imageData, mirrorHorizontal, mirrorVertical, rotationAngle, isometric}: Props) => {
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
    <IsoTileVolume
      from={from}
      to={to}
      height={height}
      fill={color.value}
      cornerRadius={radius || 22}
      imageData={imageData}
      mirrorHorizontal={mirrorHorizontal}
      mirrorVertical={mirrorVertical}
      rotationAngle={rotationAngle}
      isometric={isometric}
      {...strokeProps}
    />
  );
};