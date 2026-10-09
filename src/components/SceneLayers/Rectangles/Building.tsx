import React, { useMemo } from 'react';
import { Coords, Rectangle } from 'src/types';
import { Svg } from 'src/components/Svg/Svg';
import { useModelStore } from 'src/stores/modelStore';
import { DEFAULTS_BUILDING } from 'src/config';
import { BuildingFace, getBuilding, shadeColor } from 'src/utils';

interface Props {
  from: Coords;
  to: Coords;
  height: number;
  color: string;
  building: NonNullable<Rectangle['building']>;
}

const OPENING_COLORS = {
  WINDOW: '#cfe7f5',
  DOOR: '#6d4c35',
  frame: '#4a4a4a'
};

export const Building = ({ from, to, height, color, building }: Props) => {
  const colors = useModelStore((state) => {
    return state.colors;
  });
  const settings = { ...DEFAULTS_BUILDING, ...building };
  const roofColor =
    colors?.find(({ id }) => {
      return id === building.roofColor;
    })?.value ??
    // Tiles on a sloped roof, a grey slab on a flat one
    (settings.roof === 'FLAT'
      ? DEFAULTS_BUILDING.flatRoofColor
      : DEFAULTS_BUILDING.roofColor);

  const { faces, openings } = useMemo(() => {
    return getBuilding({
      from,
      to,
      height,
      roof: settings.roof,
      roofHeight: settings.roofHeight,
      windows: settings.windows,
      door: settings.door,
      doorFacade: settings.doorFacade
    });
  }, [
    from,
    to,
    height,
    settings.roof,
    settings.roofHeight,
    settings.windows,
    settings.door,
    settings.doorFacade
  ]);

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

    return { x: Math.min(...xs), y: Math.min(...ys) };
  }, [faces]);

  const toLocal = (points: Coords[]) => {
    return points
      .map(({ x, y }) => {
        return `${x - bounds.x},${y - bounds.y}`;
      })
      .join(' ');
  };

  const getFill = (face: BuildingFace) => {
    return shadeColor(face.kind === 'ROOF' ? roofColor : color, face.shade);
  };

  return (
    <Svg
      style={{
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        overflow: 'visible'
      }}
      width={1}
      height={1}
    >
      {faces.map((face, index) => {
        return (
          <polygon
            // eslint-disable-next-line react/no-array-index-key
            key={`face-${index}`}
            points={toLocal(face.points)}
            fill={getFill(face)}
            stroke={shadeColor(face.kind === 'ROOF' ? roofColor : color, 1.2)}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        );
      })}
      {openings.map((opening, index) => {
        return (
          <polygon
            // eslint-disable-next-line react/no-array-index-key
            key={`opening-${index}`}
            points={toLocal(opening.points)}
            fill={OPENING_COLORS[opening.kind]}
            stroke={OPENING_COLORS.frame}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
};
