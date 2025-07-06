import React, { useMemo } from 'react';
import { useScene } from 'src/hooks/useScene';
import { Svg } from 'src/components/Svg/Svg';
import { getColorVariant } from 'src/utils';
import { useColor } from 'src/hooks/useColor';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { UNPROJECTED_TILE_SIZE } from 'src/config';

type Props = ReturnType<typeof useScene>['volumes'][0];

export const Volume = ({ from, to, color: colorId, style, width, radius, height = 1, hasRoof = true }: Props) => {
  const color = useColor(colorId);
  
  const { css, pxSize } = useIsoProjection({
    from,
    to
  });

  // Only apply stroke when style is not 'NONE'
  const strokeColor = style && style !== 'NONE' ? getColorVariant(color.value, 'dark', { grade: 2 }) : undefined;
  const strokeWidth = style && style !== 'NONE' ? width || 1 : undefined;
  const strokeDasharray = style && style === 'DASHED' ? '5,5' : undefined;

  // Calculate the height in pixels
  const heightPx = height * UNPROJECTED_TILE_SIZE / 2;

  // Calculate colors for different faces
  const mainColor = color.value;
  const darkColor = getColorVariant(mainColor, 'dark', { grade: 1 });
  const darkerColor = getColorVariant(mainColor, 'dark', { grade: 2 });

  // Calculate points for the 3D volume
  const points = useMemo(() => {
    const w = pxSize.width;
    const h = pxSize.height;
    
    // Base rectangle (bottom face)
    const bottomLeft = { x: 0, y: h };
    const bottomRight = { x: w, y: h };
    const topLeft = { x: 0, y: 0 };
    const topRight = { x: w, y: 0 };
    
    // Top rectangle (top face) - shifted up by heightPx
    const topLeftTop = { x: topLeft.x, y: topLeft.y - heightPx };
    const topRightTop = { x: topRight.x, y: topRight.y - heightPx };
    const bottomLeftTop = { x: bottomLeft.x, y: bottomLeft.y - heightPx };
    const bottomRightTop = { x: bottomRight.x, y: bottomRight.y - heightPx };
    
    return {
      bottomLeft,
      bottomRight,
      topLeft,
      topRight,
      topLeftTop,
      topRightTop,
      bottomLeftTop,
      bottomRightTop
    };
  }, [pxSize, heightPx]);

  return (
    <Svg viewboxSize={{
      width: pxSize.width,
      height: pxSize.height + heightPx
    }} style={{
      ...css,
      height: `${parseInt(css.height as string) + heightPx}px`
    }}>
      {/* Left wall */}
      <polygon
        points={`${points.bottomLeft.x},${points.bottomLeft.y} ${points.topLeft.x},${points.topLeft.y} ${points.topLeftTop.x},${points.topLeftTop.y} ${points.bottomLeftTop.x},${points.bottomLeftTop.y}`}
        fill={darkColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
      
      {/* Right wall */}
      <polygon
        points={`${points.bottomRight.x},${points.bottomRight.y} ${points.topRight.x},${points.topRight.y} ${points.topRightTop.x},${points.topRightTop.y} ${points.bottomRightTop.x},${points.bottomRightTop.y}`}
        fill={darkerColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
      
      {/* Roof (top face) - only if hasRoof is true */}
      {hasRoof && (
        <polygon
          points={`${points.topLeftTop.x},${points.topLeftTop.y} ${points.topRightTop.x},${points.topRightTop.y} ${points.bottomRightTop.x},${points.bottomRightTop.y} ${points.bottomLeftTop.x},${points.bottomLeftTop.y}`}
          fill={mainColor}
          rx={radius || 0}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      )}
    </Svg>
  );
};