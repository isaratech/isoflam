import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import type { useScene } from 'src/hooks/useScene';
import { Svg } from 'src/components/Svg/Svg';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { UNPROJECTED_TILE_SIZE } from 'src/config';
import { getBoundingBox, getRoadNetwork, isRoad } from 'src/utils';

interface Props {
  connectors: ReturnType<typeof useScene>['connectors'];
}

const ROAD = {
  width: UNPROJECTED_TILE_SIZE * 0.8,
  edgeWidth: UNPROJECTED_TILE_SIZE * 0.04,
  asphalt: '#5f6368',
  marking: '#ffffff'
};

const asphaltWidth = ROAD.width - ROAD.edgeWidth * 2;

// All roads are drawn together, pass by pass, so that where they meet the edge lines
// and centre lines of one road don't cut across another
export const Roads = ({ connectors }: Props) => {
  const roads = useMemo(() => {
    return connectors.filter((connector) => {
      return isRoad(connector) && connector.path;
    });
  }, [connectors]);

  const bounds = useMemo(() => {
    const tiles = roads.flatMap((road) => {
      return [road.path.rectangle.from, road.path.rectangle.to];
    });

    return getBoundingBox(tiles.length ? tiles : [{ x: 0, y: 0 }]);
  }, [roads]);

  const { css, pxSize } = useIsoProjection({ from: bounds[0], to: bounds[2] });

  const network = useMemo(() => {
    return getRoadNetwork(
      roads.map((road) => {
        return road.path;
      }),
      // Local svg position of a tile centre: x grows with the tile x, y with the opposite of the tile y
      (tile) => {
        return {
          x: (tile.x - bounds[0].x + 0.5) * UNPROJECTED_TILE_SIZE,
          y: (bounds[2].y - tile.y + 0.5) * UNPROJECTED_TILE_SIZE
        };
      },
      UNPROJECTED_TILE_SIZE
    );
  }, [roads, bounds]);

  if (roads.length === 0) return null;

  const junctionSquare = (size: number, fill: string) => {
    return network.junctions.map(({ x, y }) => {
      return (
        <rect
          key={`${x},${y}`}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill={fill}
        />
      );
    });
  };

  return (
    <Box style={css}>
      <Svg viewboxSize={pxSize}>
        {/* 1. Edge lines: the full road width in white */}
        {network.paths.map((d) => {
          return (
            <path
              key={`edge-${d}`}
              d={d}
              fill="none"
              stroke={ROAD.marking}
              strokeWidth={ROAD.width}
            />
          );
        })}
        {junctionSquare(ROAD.width, ROAD.marking)}

        {/* 2. Asphalt, narrower so the edge lines stay visible */}
        {network.paths.map((d) => {
          return (
            <path
              key={`asphalt-${d}`}
              d={d}
              fill="none"
              stroke={ROAD.asphalt}
              strokeWidth={asphaltWidth}
            />
          );
        })}

        {/* 3. Dashed centre lines */}
        {network.paths.map((d) => {
          return (
            <path
              key={`centre-${d}`}
              d={d}
              fill="none"
              stroke={ROAD.marking}
              strokeWidth={UNPROJECTED_TILE_SIZE * 0.05}
              strokeDasharray={`${UNPROJECTED_TILE_SIZE * 0.3}, ${
                UNPROJECTED_TILE_SIZE * 0.25
              }`}
            />
          );
        })}

        {/* 4. Junctions are plain asphalt, without centre lines */}
        {junctionSquare(asphaltWidth, ROAD.asphalt)}
      </Svg>
    </Box>
  );
};
