import React, {useMemo} from 'react';
import {Box, useTheme} from '@mui/material';
import {UNPROJECTED_TILE_SIZE} from 'src/config';
import {getAnchorTile, getColorVariant} from 'src/utils';
import {Circle} from 'src/components/Circle/Circle';
import {Svg} from 'src/components/Svg/Svg';
import {useIsoProjection} from 'src/hooks/useIsoProjection';
import {useRoad} from 'src/hooks/useRoad';
import {useScene} from 'src/hooks/useScene';
import {useColor} from 'src/hooks/useColor';

interface Props {
  road: ReturnType<typeof useScene>['roads'][0];
  isSelected?: boolean;
}

export const Road = ({ road: _road, isSelected }: Props) => {
  const theme = useTheme();
  const color = useColor(_road.color);
  const { currentView } = useScene();
  const road = useRoad(_road.id);

  // Call all hooks first, then handle the conditional logic
  const { css, pxSize } = useIsoProjection({
      ...road.path?.rectangle || {from: {x: 0, y: 0}, to: {x: 0, y: 0}}
  });

  const drawOffset = useMemo(() => {
    return {
      x: UNPROJECTED_TILE_SIZE / 2,
      y: UNPROJECTED_TILE_SIZE / 2
    };
  }, []);

  const pathString = useMemo(() => {
      if (!road.path?.tiles) return '';
    return road.path.tiles.reduce((acc, tile) => {
      return `${acc} ${tile.x * UNPROJECTED_TILE_SIZE + drawOffset.x},${
        tile.y * UNPROJECTED_TILE_SIZE + drawOffset.y
      }`;
    }, '');
  }, [road.path?.tiles, drawOffset]);

  const anchorPositions = useMemo(() => {
      if (!isSelected || !currentView || !road.path?.rectangle) return [];

    return road.anchors.map((anchor) => {
      const position = getAnchorTile(anchor, currentView);

      return {
        ...position,
        id: anchor.id
      };
    });
  }, [isSelected, currentView, road.anchors, road.path?.rectangle]);

  // Procedural road generation based on width
  const roadElements = useMemo(() => {
    if (!road.path?.tiles || road.path.tiles.length < 2) return null;

    const elements = [];
    const width = road.width || 2;
    const roadColor = color?.value || '#333333'; // Default dark road color
    
    // Calculate road points
    const points = road.path.tiles.map(tile => ({
      x: tile.x * UNPROJECTED_TILE_SIZE + drawOffset.x,
      y: tile.y * UNPROJECTED_TILE_SIZE + drawOffset.y
    }));

    // Main road base (asphalt)
    elements.push(
      <polyline
        key="road-base"
        points={pathString.trim()}
        stroke={roadColor}
        strokeWidth={width * UNPROJECTED_TILE_SIZE}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    );

    // Road markings based on width
    if (width >= 2) {
      // Center line (white) for minimum width
      elements.push(
        <polyline
          key="center-line"
          points={pathString.trim()}
          stroke="white"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={width === 2 ? "0" : "10,10"} // Solid for width 2, dashed for larger
        />
      );
    }

    if (width >= 4) {
      // Two-way road with additional markings
      const sideOffset = (width * UNPROJECTED_TILE_SIZE) / 4;
      
      // Create side lines (dashed white lines)
      for (let side of [-1, 1]) {
        const sidePoints = points.map((point, index) => {
          if (index === 0) return point;
          
          const prevPoint = points[index - 1];
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length === 0) return point;
          
          // Calculate perpendicular offset
          const perpX = -dy / length * sideOffset * side;
          const perpY = dx / length * sideOffset * side;
          
          return {
            x: point.x + perpX,
            y: point.y + perpY
          };
        });

        const sidePathString = sidePoints.reduce((acc, point) => {
          return `${acc} ${point.x},${point.y}`;
        }, '');

        elements.push(
          <polyline
            key={`side-line-${side}`}
            points={sidePathString.trim()}
            stroke="white"
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5,5"
            opacity={0.8}
          />
        );
      }
    }

    if (width >= 6) {
      // Additional lanes for wider roads
      const laneOffset = (width * UNPROJECTED_TILE_SIZE) / 6;
      
      for (let lane of [-2, 2]) {
        const lanePoints = points.map((point, index) => {
          if (index === 0) return point;
          
          const prevPoint = points[index - 1];
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length === 0) return point;
          
          const perpX = -dy / length * laneOffset * lane;
          const perpY = dx / length * laneOffset * lane;
          
          return {
            x: point.x + perpX,
            y: point.y + perpY
          };
        });

        const lanePathString = lanePoints.reduce((acc, point) => {
          return `${acc} ${point.x},${point.y}`;
        }, '');

        elements.push(
          <polyline
            key={`lane-line-${lane}`}
            points={lanePathString.trim()}
            stroke="white"
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="3,7"
            opacity={0.6}
          />
        );
      }
    }

    return elements;
  }, [road.path?.tiles, road.width, pathString, drawOffset, color?.value]);

  if (!road.path?.tiles) return null;

  return (
    <Box sx={css}>
      <Svg viewBox={`0 0 ${pxSize.width} ${pxSize.height}`}>
        {roadElements}
        
        {/* Anchor points when selected */}
        {isSelected &&
          anchorPositions.map((anchorPosition) => {
            return (
              <Circle
                key={anchorPosition.id}
                tile={anchorPosition}
                radius={8}
                fill={theme.palette.info.main}
                opacity={0.5}
              />
            );
          })}
      </Svg>
    </Box>
  );
};