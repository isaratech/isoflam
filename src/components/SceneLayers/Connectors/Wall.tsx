import React, { useMemo } from 'react';
import { Coords } from 'src/types';
import { Svg } from 'src/components/Svg/Svg';
import { getWallFaces, shadeColor, WallFace } from 'src/utils';

interface Props {
  // Ground tiles the wall stands on, in order
  tiles: Coords[];
  height: number;
  color: string;
  // Stroke of the wall's top edge
  strokeWidth: number;
  strokeDasharray: string;
}

const faceShade: Record<WallFace['side'], number> = {
  LEFT: 0.4,
  FRONT: 0.6,
  RIGHT: 0.8
};

export const Wall = ({
  tiles,
  height,
  color,
  strokeWidth,
  strokeDasharray
}: Props) => {
  const faces = useMemo(() => {
    return getWallFaces(tiles, height);
  }, [tiles, height]);

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
        const [, , topEnd, topStart] = face.points;

        return (
          // eslint-disable-next-line react/no-array-index-key
          <g key={index}>
            <polygon
              points={face.points.map(toLocal).join(' ')}
              fill={shadeColor(color, faceShade[face.side])}
              stroke={shadeColor(color, 1.2)}
              strokeWidth={1}
              strokeLinejoin="round"
            />
            {/* Top edge, drawn with the connector's style */}
            <line
              x1={topStart.x - bounds.x}
              y1={topStart.y - bounds.y}
              x2={topEnd.x - bounds.x}
              y2={topEnd.y - bounds.y}
              stroke={shadeColor(color, 1.2)}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </Svg>
  );
};
