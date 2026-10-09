import React, { useMemo } from 'react';
import chroma from 'chroma-js';
import { Coords } from 'src/types';
import { Svg } from 'src/components/Svg/Svg';
import { getVolumeFaces, shadeColor, VolumeFace } from 'src/utils';

interface Props {
  from: Coords;
  to: Coords;
  height: number;
  roof: boolean;
  color: string;
  stroke?: {
    width: number;
    color: string;
    style?: 'NONE' | 'SOLID' | 'DOTTED' | 'DASHED';
  };
}

// Shade each face like a light coming from the top left
const getFaceFill = (color: string, side: VolumeFace['side']) => {
  switch (side) {
    case 'LEFT':
      return shadeColor(color, 0.4);
    case 'RIGHT':
      return shadeColor(color, 0.8);
    case 'ROOF':
      return chroma(color).brighten(0.3).css();
    case 'FLOOR':
    default:
      return color;
  }
};

export const Volume = ({ from, to, height, roof, color, stroke }: Props) => {
  const faces = useMemo(() => {
    return getVolumeFaces({ from, to, height, roof });
  }, [from, to, height, roof]);

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

  const strokeProps = useMemo(() => {
    if (!stroke || stroke.style === 'NONE') {
      // Keep the edges readable when the faces share a similar color
      return {
        stroke: shadeColor(color, 1.2),
        strokeWidth: 1
      };
    }

    let strokeDasharray: string | undefined;
    if (stroke.style === 'DASHED') {
      strokeDasharray = `${stroke.width * 2}, ${stroke.width * 2}`;
    } else if (stroke.style === 'DOTTED') {
      strokeDasharray = `0, ${stroke.width * 1.8}`;
    }

    return {
      stroke: stroke.color,
      strokeWidth: stroke.width,
      strokeDasharray
    };
  }, [stroke, color]);

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
      {faces.map((face) => {
        return (
          <polygon
            key={face.side}
            points={face.points
              .map(({ x, y }) => {
                return `${x - bounds.x},${y - bounds.y}`;
              })
              .join(' ')}
            fill={getFaceFill(color, face.side)}
            strokeLinejoin="round"
            {...strokeProps}
          />
        );
      })}
    </Svg>
  );
};
