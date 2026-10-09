import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import type { useScene } from 'src/hooks/useScene';
import { Svg } from 'src/components/Svg/Svg';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { UNPROJECTED_TILE_SIZE } from 'src/config';
import {
  getBoundingBox,
  getRoadNetwork,
  getRoadOuterWidth,
  getRoadWidth,
  isRoad,
  SIDEWALK_WIDTH
} from 'src/utils';

interface Props {
  connectors: ReturnType<typeof useScene>['connectors'];
}

const COLORS = {
  asphalt: '#5f6368',
  marking: '#ffffff',
  sidewalk: '#c9c6c0',
  curb: '#a19d96'
};
const EDGE_WIDTH = UNPROJECTED_TILE_SIZE * 0.06;
const CURB_WIDTH = UNPROJECTED_TILE_SIZE * 0.08;

// All roads are drawn together, pass by pass, so that where they meet the sidewalks, edge
// lines and centre lines of one road don't cut across another
export const Roads = ({ connectors }: Props) => {
  const roads = useMemo(() => {
    return connectors.filter((connector) => {
      return isRoad(connector) && connector.path;
    });
  }, [connectors]);

  // Wide enough for the widest road and its sidewalks on every side of the paths
  const bounds = useMemo(() => {
    const margin = Math.ceil(
      Math.max(
        0,
        ...roads.map((road) => {
          return getRoadOuterWidth(road);
        })
      ) / 2
    );
    const tiles = roads.flatMap((road) => {
      return [road.path.rectangle.from, road.path.rectangle.to];
    });

    return getBoundingBox(tiles.length ? tiles : [{ x: 0, y: 0 }], {
      x: margin,
      y: margin
    });
  }, [roads]);

  const { css, pxSize } = useIsoProjection({ from: bounds[0], to: bounds[2] });

  const network = useMemo(() => {
    return getRoadNetwork(
      roads.map((road) => {
        return {
          path: road.path,
          width: getRoadWidth(road),
          sidewalks: road.sidewalks
        };
      }),
      // Local svg position of a tile point: x grows with the tile x, y with the opposite of the tile y
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

  const strokes = (
    pass: string,
    getWidth: (width: number) => number,
    color: string,
    extra: React.SVGProps<SVGPathElement> = {},
    filter: (road: { sidewalks: boolean }) => boolean = () => {
      return true;
    }
  ) => {
    return network.roads.map((road, index) => {
      if (!filter(road)) return null;

      return (
        <path
          // eslint-disable-next-line react/no-array-index-key
          key={`${pass}-${index}`}
          d={road.d}
          fill="none"
          stroke={color}
          strokeWidth={getWidth(road.width * UNPROJECTED_TILE_SIZE)}
          {...extra}
        />
      );
    });
  };

  const junctionPatches = (
    getSize: (width: number) => number,
    fill: string
  ) => {
    return network.junctions.map(({ position, size }) => {
      // Svg x follows the tile x, svg y the tile y
      const width = getSize(size.x * UNPROJECTED_TILE_SIZE);
      const height = getSize(size.y * UNPROJECTED_TILE_SIZE);

      return (
        <rect
          key={`${Math.round(position.x)},${Math.round(position.y)}`}
          x={position.x - width / 2}
          y={position.y - height / 2}
          width={width}
          height={height}
          fill={fill}
        />
      );
    });
  };

  const hasSidewalks = (road: { sidewalks: boolean }) => {
    return road.sidewalks;
  };
  const sidewalksWidth = SIDEWALK_WIDTH * 2 * UNPROJECTED_TILE_SIZE;

  return (
    <Box style={css}>
      <Svg viewboxSize={pxSize}>
        {/* 1. Sidewalks: a curb line, then the pavement */}
        {strokes(
          'curb',
          (width) => {
            return width + sidewalksWidth;
          },
          COLORS.curb,
          {},
          hasSidewalks
        )}
        {strokes(
          'sidewalk',
          (width) => {
            return width + sidewalksWidth - CURB_WIDTH * 2;
          },
          COLORS.sidewalk,
          {},
          hasSidewalks
        )}

        {/* 2. Edge lines: the full road width in white */}
        {strokes(
          'edge',
          (width) => {
            return width;
          },
          COLORS.marking
        )}
        {junctionPatches((width) => {
          return width;
        }, COLORS.marking)}

        {/* 3. Asphalt, narrower so the edge lines stay visible */}
        {strokes(
          'asphalt',
          (width) => {
            return width - EDGE_WIDTH * 2;
          },
          COLORS.asphalt
        )}

        {/* 4. Dashed centre lines */}
        {strokes(
          'centre',
          () => {
            return UNPROJECTED_TILE_SIZE * 0.08;
          },
          COLORS.marking,
          {
            strokeDasharray: `${UNPROJECTED_TILE_SIZE * 0.5}, ${
              UNPROJECTED_TILE_SIZE * 0.4
            }`
          }
        )}

        {/* 5. Junctions are plain asphalt, without centre lines */}
        {junctionPatches((width) => {
          return width - EDGE_WIDTH * 2;
        }, COLORS.asphalt)}
      </Svg>
    </Box>
  );
};
