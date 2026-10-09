import React from 'react';
import { useScene } from 'src/hooks/useScene';
import { IsoTileArea } from 'src/components/IsoTileArea/IsoTileArea';
import { getColorVariant, isVolume } from 'src/utils';
import { useColor } from 'src/hooks/useColor';
import { Volume } from './Volume';
import { Building } from './Building';

type Props = ReturnType<typeof useScene>['rectangles'][0];

export const Rectangle = ({
  from,
  to,
  color: colorId,
  style,
  width,
  radius,
  imageData,
  mirrorHorizontal,
  mirrorVertical,
  rotationAngle,
  isometric,
  height,
  roof,
  texture,
  building
}: Props) => {
  const color = useColor(colorId);

  // Only apply stroke when style is not 'NONE'
  const strokeProps =
    style && style !== 'NONE'
      ? {
          stroke: {
            color: getColorVariant(color.value, 'dark', { grade: 2 }),
            width: width || 1,
            style
          }
        }
      : {};

  if (isVolume({ height, imageData, texture }) && building) {
    return (
      <Building
        from={from}
        to={to}
        height={height}
        color={color.value}
        building={building}
      />
    );
  }

  if (isVolume({ height, imageData, texture })) {
    return (
      <Volume
        from={from}
        to={to}
        height={height}
        roof={roof}
        color={color.value}
        {...strokeProps}
      />
    );
  }

  return (
    <IsoTileArea
      from={from}
      to={to}
      fill={color.value}
      cornerRadius={radius ?? 22}
      imageData={imageData}
      mirrorHorizontal={mirrorHorizontal}
      mirrorVertical={mirrorVertical}
      rotationAngle={rotationAngle}
      isometric={isometric}
      texture={texture}
      {...strokeProps}
    />
  );
};
