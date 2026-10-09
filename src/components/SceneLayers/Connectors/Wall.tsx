import React, { useMemo } from 'react';
import { Coords } from 'src/types';
import chroma from 'chroma-js';
import { Svg } from 'src/components/Svg/Svg';
import { getWallFaces, shadeColor, WallFace } from 'src/utils';

interface Props {
  // Corner tiles of the wall, in order
  corners: Coords[];
  height: number;
  // In tiles
  thickness: number;
  color: string;
}

const getFaceFill = (color: string, face: WallFace) => {
  return face.kind === 'TOP'
    ? chroma(color).brighten(0.3).css()
    : shadeColor(color, face.shade);
};

export const Wall = ({ corners, height, thickness, color }: Props) => {
  const faces = useMemo(() => {
    return getWallFaces(corners, height, thickness);
  }, [corners, height, thickness]);

  // The faces are in scene coordinates; the svg is placed over their bounding box
  const bounds = useMemo(() => {
    const points = faces.flatMap((face) => {
      return face.points;
    });
    const xs = points.map(({ x }) => {
      return x;
    });
    const ys = points.map(({ y }) => {
      return y;
    });

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }, [faces]);

  const toLocal = ({ x, y }: Coords) => {
    return `${x - bounds.x},${y - bounds.y}`;
  };

  if (faces.length === 0) return null;

  return (
    <Svg
      viewboxSize={{ width: bounds.width, height: bounds.height }}
      style={{
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        overflow: 'visible'
      }}
    >
      {faces.map((face, index) => {
        return (
          <polygon
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            points={face.points.map(toLocal).join(' ')}
            fill={getFaceFill(color, face)}
            stroke={shadeColor(color, 1.2)}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
};
