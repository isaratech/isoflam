import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { UNPROJECTED_TILE_SIZE } from 'src/config';
import {
  getAnchorTile,
  getColorVariant,
  getConnectorDirectionIcon,
  getConnectorGlobalTiles,
  getWallHeight,
  isRoad
} from 'src/utils';
import { Circle } from 'src/components/Circle/Circle';
import { Svg } from 'src/components/Svg/Svg';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { useScene } from 'src/hooks/useScene';
import { useColor } from 'src/hooks/useColor';
import { Wall } from './Wall';

interface Props {
  connector: ReturnType<typeof useScene>['connectors'][0];
  isSelected?: boolean;
}

export const Connector = ({ connector, isSelected }: Props) => {
  const theme = useTheme();
  const color = useColor(connector.color);
  const { currentView } = useScene();

  // Call all hooks first, then handle the conditional logic
  const { css, pxSize } = useIsoProjection({
    ...(connector.path?.rectangle || {
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 }
    })
  });

  const wallHeight = getWallHeight(connector);
  // Roads are drawn together by the Roads layer; only their handles are drawn here
  const isRoadConnector = isRoad(connector);

  const wallTiles = useMemo(() => {
    if (!wallHeight || !connector.path) return [];

    return getConnectorGlobalTiles(connector.path);
  }, [wallHeight, connector.path]);

  const drawOffset = useMemo(() => {
    return {
      x: UNPROJECTED_TILE_SIZE / 2,
      y: UNPROJECTED_TILE_SIZE / 2
    };
  }, []);

  const pathString = useMemo(() => {
    if (!connector.path?.tiles) return '';
    return connector.path.tiles.reduce((acc, tile) => {
      return `${acc} ${tile.x * UNPROJECTED_TILE_SIZE + drawOffset.x},${
        tile.y * UNPROJECTED_TILE_SIZE + drawOffset.y
      }`;
    }, '');
  }, [connector.path?.tiles, drawOffset]);

  const anchorPositions = useMemo(() => {
    if (!isSelected || !currentView || !connector.path?.rectangle) return [];

    return connector.anchors.map((anchor) => {
      const position = getAnchorTile(anchor, currentView);

      return {
        id: anchor.id,
        x:
          (connector.path.rectangle.from.x - position.x) *
            UNPROJECTED_TILE_SIZE +
          drawOffset.x,
        y:
          (connector.path.rectangle.from.y - position.y) *
            UNPROJECTED_TILE_SIZE +
          drawOffset.y
      };
    });
  }, [
    currentView,
    connector.path?.rectangle,
    connector.anchors,
    drawOffset,
    isSelected
  ]);

  const directionIcon = useMemo(() => {
    if (!connector.path?.tiles) return null;
    return getConnectorDirectionIcon(connector.path.tiles);
  }, [connector.path?.tiles]);

  const connectorWidthPx = useMemo(() => {
    return (UNPROJECTED_TILE_SIZE / 100) * connector.width;
  }, [connector.width]);

  const strokeDashArray = useMemo(() => {
    switch (connector.style) {
      case 'DASHED':
        return `${connectorWidthPx * 2}, ${connectorWidthPx * 2}`;
      case 'DOTTED':
        return `0, ${connectorWidthPx * 1.8}`;
      case 'SOLID':
      default:
        return 'none';
    }
  }, [connector.style, connectorWidthPx]);

  // Guard against undefined path - this can happen during connector creation or validation failures
  // Now we can safely return early after all hooks have been called
  if (!connector.path) {
    return null;
  }

  const strokeColor = getColorVariant(color.value, 'dark', { grade: 1 });
  // Walls and roads only show their anchor handles in this ground-level drawing
  const isFlatLine = !wallHeight && !isRoadConnector;

  return (
    <>
      {wallHeight > 0 && (
        <Wall
          tiles={wallTiles}
          height={wallHeight}
          color={color.value}
          strokeWidth={Math.max(2, connectorWidthPx / 2)}
          strokeDasharray={strokeDashArray}
        />
      )}
      <Box style={css}>
        <Svg
          style={{
            // TODO: The original x coordinates of each tile seems to be calculated wrongly.
            // They are mirrored along the x-axis.  The hack below fixes this, but we should
            // try to fix this issue at the root of the problem (might have further implications).
            transform: 'scale(-1, 1)'
          }}
          viewboxSize={pxSize}
        >
          {isFlatLine && (
            <>
              <polyline
                points={pathString}
                stroke={theme.palette.common.white}
                strokeWidth={connectorWidthPx * 1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.7}
                strokeDasharray={strokeDashArray}
                fill="none"
              />
              <polyline
                points={pathString}
                stroke={strokeColor}
                strokeWidth={connectorWidthPx}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={strokeDashArray}
                fill="none"
              />
            </>
          )}

          {anchorPositions.map((anchor) => {
            return (
              <g key={anchor.id}>
                <Circle
                  tile={anchor}
                  radius={18}
                  fill={theme.palette.common.white}
                  fillOpacity={0.7}
                />
                <Circle
                  tile={anchor}
                  radius={12}
                  stroke={theme.palette.common.black}
                  fill={theme.palette.common.white}
                  strokeWidth={6}
                />
              </g>
            );
          })}

          {isFlatLine && directionIcon && (connector.showTriangle ?? true) && (
            <g transform={`translate(${directionIcon.x}, ${directionIcon.y})`}>
              <g transform={`rotate(${directionIcon.rotation})`}>
                <polygon
                  fill="black"
                  stroke={theme.palette.common.white}
                  strokeWidth={4}
                  points="17.58,17.01 0,-17.01 -17.58,17.01"
                />
              </g>
            </g>
          )}
        </Svg>
      </Box>
    </>
  );
};
