import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { UNPROJECTED_TILE_SIZE } from 'src/config';
import {
  connectorPathTileToGlobal,
  getAnchorTile,
  getColorVariant,
  getConnectorDirectionIcon,
  getConnectorElevation,
  getTilePosition
} from 'src/utils';
import { Circle } from 'src/components/Circle/Circle';
import { Svg } from 'src/components/Svg/Svg';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { useScene } from 'src/hooks/useScene';
import { useColor } from 'src/hooks/useColor';

interface Props {
  connector: ReturnType<typeof useScene>['connectors'][0];
  isSelected?: boolean;
}

export const Connector = ({ connector, isSelected }: Props) => {
  const theme = useTheme();
  const color = useColor(connector.color);
  const { currentView } = useScene();

  // Call all hooks first, then handle the conditional logic
  const {
    css,
    pxSize,
    position: boxPosition
  } = useIsoProjection({
    ...(connector.path?.rectangle || {
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 }
    })
  });

  const elevation = getConnectorElevation(connector.height);

  // Ground positions of both ends, used to draw the vertical drop lines of a raised connector
  const endPositions = useMemo(() => {
    const tiles = connector.path?.tiles;
    if (!elevation || !tiles?.length) return [];

    return [tiles[0], tiles[tiles.length - 1]].map((tile) => {
      return getTilePosition({
        tile: connectorPathTileToGlobal(tile, connector.path.rectangle.from)
      });
    });
  }, [elevation, connector.path]);

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

  return (
    <>
      {endPositions.map((endPosition, index) => {
        return (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{
              position: 'absolute',
              left: endPosition.x,
              top: endPosition.y - elevation,
              height: elevation,
              borderLeft: `${Math.max(
                2,
                connectorWidthPx / 2
              )}px dashed ${strokeColor}`,
              transform: 'translateX(-50%)'
            }}
          />
        );
      })}
      <Box style={{ ...css, top: boxPosition.y - elevation }}>
        <Svg
          style={{
            // TODO: The original x coordinates of each tile seems to be calculated wrongly.
            // They are mirrored along the x-axis.  The hack below fixes this, but we should
            // try to fix this issue at the root of the problem (might have further implications).
            transform: 'scale(-1, 1)'
          }}
          viewboxSize={pxSize}
        >
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

          {directionIcon && (connector.showTriangle ?? true) && (
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
