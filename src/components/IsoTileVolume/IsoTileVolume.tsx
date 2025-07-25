import React, {useMemo} from 'react';
import {Coords} from 'src/types';
import {Svg} from 'src/components/Svg/Svg';
import {useIsoProjection} from 'src/hooks/useIsoProjection';
import {UNPROJECTED_TILE_SIZE} from 'src/config';
import {getBoundingBox, getTilePosition} from 'src/utils';

interface Props {
  from: Coords;
  to: Coords;
  height: number; // Height in tile units
  origin?: Coords;
  fill?: string;
  cornerRadius?: number;
  stroke?: {
    width: number;
    color: string;
    style?: 'NONE' | 'SOLID' | 'DOTTED' | 'DASHED';
  };
  imageData?: string; // Base64 encoded image data
  mirrorHorizontal?: boolean; // Horizontal mirroring for images
  mirrorVertical?: boolean; // Vertical mirroring for images
  rotationAngle?: number; // Rotation angle in degrees (0, 90, 180, 270)
  isometric?: boolean; // Whether to use isometric projection (default: true)
}

export const IsoTileVolume = ({
  from,
  to,
  height = 1,
  fill = 'none',
  cornerRadius = 0,
  stroke,
  imageData,
  mirrorHorizontal = false,
  mirrorVertical = false,
  rotationAngle = 0,
  isometric = true
}: Props) => {
  const isoProjection = useIsoProjection({
    from,
    to
  });

  // For standard mode, calculate non-isometric positioning using the same coordinate system as isometric
  const standardProjection = useMemo(() => {
    const gridSize = {
      width: Math.abs(from.x - to.x) + 1,
      height: Math.abs(from.y - to.y) + 1
    };

    const pxSize = {
      width: gridSize.width * UNPROJECTED_TILE_SIZE,
      height: gridSize.height * UNPROJECTED_TILE_SIZE
    };

    // Use the same coordinate system as isometric projection
    const boundingBox = getBoundingBox([from, to]);
    const origin = boundingBox[3]; // bottom-left corner, same as isometric
    const position = getTilePosition({
      tile: origin,
      origin: 'CENTER'
    });

    return {
      css: {
        position: 'absolute' as const,
        left: position.x,
        top: position.y - pxSize.height / 2,
        width: `${pxSize.width}px`,
        height: `${pxSize.height}px`,
        transform: 'none', // No isometric transform
        transformOrigin: 'top left'
      },
      pxSize
    };
  }, [from, to]);

  const {css, pxSize} = isometric ? isoProjection : standardProjection;

  // Adjust CSS positioning for expanded 3D volumes
  const finalCss = useMemo(() => {
    if (!isometric || height <= 0) {
      return css;
    }

    // For 3D volumes, we need to offset the positioning to account for the expanded viewbox
    const halfTile = UNPROJECTED_TILE_SIZE / 2;
    const isoDepthX = halfTile * height;  // X offset for isometric depth (rightward)
    const isoDepthY = halfTile * height;  // Y offset for isometric depth (upward)

    return {
      ...css,
      // Adjust position and size to account for the expanded viewbox
      top: (css.top as number) - isoDepthY,
      width: `${(pxSize.width + isoDepthX)}px`,
      height: `${(pxSize.height + isoDepthY)}px`
    };
  }, [css, isometric, height, pxSize]);

  const strokeParams = useMemo(() => {
    if (!stroke || stroke.style === 'NONE') return {};

    const params: Record<string, string | number> = {
      stroke: stroke.color,
      strokeWidth: stroke.width
    };

    // Add stroke dash array based on style
    if (stroke.style) {
      switch (stroke.style) {
        case 'DASHED':
          params.strokeDasharray = `${stroke.width * 2}, ${stroke.width * 2}`;
          break;
        case 'DOTTED':
          params.strokeDasharray = `0, ${stroke.width * 1.8}`;
          break;
        case 'SOLID':
        default:
          // No dash array for solid lines
          break;
      }
    }

    return params;
  }, [stroke]);

  // Generate unique pattern ID for image background
  const patternId = useMemo(() => {
    return imageData ? `image-pattern-${Math.random().toString(36).substr(2, 9)}` : null;
  }, [imageData]);

  // Determine fill value - use pattern if image data exists, otherwise use provided fill
  const fillValue = useMemo(() => {
    if (imageData && patternId) {
      return `url(#${patternId})`;
    }
    return fill;
  }, [imageData, patternId, fill]);

  // Calculate transform for rotation and mirroring
  const imageTransform = useMemo(() => {
    if (!imageData || (!mirrorHorizontal && !mirrorVertical && !rotationAngle)) {
      return undefined;
    }

    const transforms = [];
    const centerX = pxSize.width / 2;
    const centerY = pxSize.height / 2;

    // Apply rotation first (around center)
    if (rotationAngle) {
      transforms.push(`translate(${centerX}, ${centerY})`);
      transforms.push(`rotate(${rotationAngle})`);
      transforms.push(`translate(${-centerX}, ${-centerY})`);
    }

    // Apply mirroring
    if (mirrorHorizontal || mirrorVertical) {
      const scaleX = mirrorHorizontal ? -1 : 1;
      const scaleY = mirrorVertical ? -1 : 1;
      const translateX = mirrorHorizontal ? pxSize.width : 0;
      const translateY = mirrorVertical ? pxSize.height : 0;

      transforms.push(`translate(${translateX}, ${translateY})`);
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }

    return transforms.length > 0 ? transforms.join(' ') : undefined;
  }, [imageData, mirrorHorizontal, mirrorVertical, rotationAngle, pxSize.width, pxSize.height]);

  // Calculate proper isometric 3D dimensions
  const heightOffset = useMemo(() => {
    // In isometric projection, height is represented as movement upward
    // Use the unprojected tile size for height units
    return height * UNPROJECTED_TILE_SIZE;
  }, [height]);

  // Calculate expanded viewbox and repositioned elements for 3D rendering
  const volumeProjection = useMemo(() => {
    if (!isometric || height <= 0) {
      return {
        expandedPxSize: pxSize,
        baseOffset: { x: 0, y: 0 },
        faces: { topFace: null, rightFace: null, frontFace: null }
      };
    }

    // Calculate isometric depth offsets
    const halfTile = UNPROJECTED_TILE_SIZE / 2;
    const isoDepthX = halfTile * height;  // Positive X offset for isometric depth (rightward)
    const isoDepthY = halfTile * height;  // Y offset for isometric depth (upward)

    // Expand viewbox to accommodate 3D faces extending outside base rectangle
    const expandedPxSize = {
      width: pxSize.width + isoDepthX,  // Add space for right wall
      height: pxSize.height + isoDepthY  // Add space for front wall extending down
    };

    // Base rectangle offset within expanded viewbox (no offset needed as base stays at origin)
    const baseOffset = { x: 0, y: isoDepthY };  // Offset base down to make room for top face

    // Top face: offset by the isometric depth (rightward and upward from base)
    const topFace = {
      x: baseOffset.x + isoDepthX,
      y: baseOffset.y - isoDepthY,
      width: pxSize.width,
      height: pxSize.height
    };

    // Right wall: connects right edge of base to right edge of top
    const rightFace = {
      points: [
        // Bottom-right corner of base
        baseOffset.x + pxSize.width, baseOffset.y + pxSize.height,
        // Top-right corner of base
        baseOffset.x + pxSize.width, baseOffset.y,
        // Top-right corner of top face
        baseOffset.x + pxSize.width + isoDepthX, baseOffset.y - isoDepthY,
        // Bottom-right corner of top face
        baseOffset.x + pxSize.width + isoDepthX, baseOffset.y + pxSize.height - isoDepthY
      ].join(',')
    };

    // Front wall: connects front edge of base to front edge of top
    const frontFace = {
      points: [
        // Bottom-left corner of base
        baseOffset.x, baseOffset.y + pxSize.height,
        // Bottom-right corner of base
        baseOffset.x + pxSize.width, baseOffset.y + pxSize.height,
        // Bottom-right corner of top face
        baseOffset.x + pxSize.width + isoDepthX, baseOffset.y + pxSize.height - isoDepthY,
        // Bottom-left corner of top face
        baseOffset.x + isoDepthX, baseOffset.y + pxSize.height - isoDepthY
      ].join(',')
    };

    return {
      expandedPxSize,
      baseOffset,
      faces: { topFace, rightFace, frontFace }
    };
  }, [pxSize, isometric, height]);

  // Use expanded size for 3D volumes, original size for 2D rectangles
  const finalPxSize = height > 0 && isometric ? volumeProjection.expandedPxSize : pxSize;

  return (
    <Svg viewboxSize={finalPxSize} style={finalCss}>
      {imageData && patternId && (
        <defs>
          <pattern
            id={patternId}
            patternUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image
              href={imageData}
              width={pxSize.width}
              height={pxSize.height}
              preserveAspectRatio="xMidYMid meet"
              transform={imageTransform}
            />
          </pattern>
        </defs>
      )}

      {/* Base/bottom face - positioned within expanded viewbox */}
      <rect
        x={height > 0 && isometric ? volumeProjection.baseOffset.x : 0}
        y={height > 0 && isometric ? volumeProjection.baseOffset.y : 0}
        width={pxSize.width}
        height={pxSize.height}
        fill={fillValue}
        rx={cornerRadius}
        opacity={0.3}
        {...strokeParams}
      />

      {height > 0 && isometric && (
        <>
          {/* Front wall - medium brightness for depth perception */}
          {volumeProjection.faces.frontFace && (
            <polygon
              points={volumeProjection.faces.frontFace.points}
              fill={fillValue}
              opacity={1.0}
              {...strokeParams}
              style={{ filter: 'brightness(0.7)' }}
            />
          )}

          {/* Right wall - darkest for maximum depth perception */}
          {volumeProjection.faces.rightFace && (
            <polygon
              points={volumeProjection.faces.rightFace.points}
              fill={fillValue}
              opacity={1.0}
              {...strokeParams}
              style={{ filter: 'brightness(0.45)' }}
            />
          )}

          {/* Top face - brightest and fully opaque as it's the most visible */}
          {volumeProjection.faces.topFace && (
            <rect
              x={volumeProjection.faces.topFace.x}
              y={volumeProjection.faces.topFace.y}
              width={volumeProjection.faces.topFace.width}
              height={volumeProjection.faces.topFace.height}
              fill={fillValue}
              rx={cornerRadius}
              opacity={1.0}
              {...strokeParams}
            />
          )}
        </>
      )}

      {/* For non-isometric mode with height, just show elevated rectangle */}
      {height > 0 && !isometric && (
        <rect
          x={0}
          y={-heightOffset}
          width={pxSize.width}
          height={pxSize.height}
          fill={fillValue}
          rx={cornerRadius}
          {...strokeParams}
        />
      )}
    </Svg>
  );
};