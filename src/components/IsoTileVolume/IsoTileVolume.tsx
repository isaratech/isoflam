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

  // Calculate isometric 3D offsets - simpler approach
  const volumeOffsets = useMemo(() => {
    if (!isometric || height <= 0) {
      return { heightOffset: 0, depthOffsetX: 0, depthOffsetY: 0 };
    }
    
    // Height offset is simple: straight up
    const heightOffset = height * UNPROJECTED_TILE_SIZE;
    
    // For isometric depth, we need to move right and slightly up
    // Using standard isometric 30-degree angles: 
    // - Rightward movement is cos(30°) ≈ 0.866 of height
    // - Upward movement is sin(30°) ≈ 0.5 of height  
    const depthOffsetX = height * UNPROJECTED_TILE_SIZE * 0.866; // cos(30°)
    const depthOffsetY = height * UNPROJECTED_TILE_SIZE * 0.5;   // sin(30°)
    
    return { heightOffset, depthOffsetX, depthOffsetY };
  }, [height, isometric]);

  // Adjust CSS positioning for expanded 3D volumes
  const finalCss = useMemo(() => {
    if (!isometric || height <= 0) {
      return css;
    }

    // Expand the container to fit the 3D volume extending beyond the base
    return {
      ...css,
      width: `${(pxSize.width + volumeOffsets.depthOffsetX)}px`,
      height: `${(pxSize.height + volumeOffsets.heightOffset)}px`
    };
  }, [css, isometric, height, pxSize, volumeOffsets]);

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

  // Calculate faces for 3D rendering - simplified approach
  const volumeFaces = useMemo(() => {
    if (!isometric || height <= 0) {
      return { base: null, top: null, front: null, right: null };
    }

    // Base face: the original rectangle position (unchanged)
    const base = {
      x: 0,
      y: 0,
      width: pxSize.width,
      height: pxSize.height
    };

    // Top face: displaced horizontally for isometric effect, vertically by pure height
    const top = {
      x: volumeOffsets.depthOffsetX,
      y: -volumeOffsets.heightOffset, // Pure vertical displacement (negative Y = up in screen coordinates)
      width: pxSize.width,
      height: pxSize.height
    };

    // Front face: connects the front edges of base and top
    const front = {
      points: [
        // Bottom edge of front face (base front edge)
        `${base.x},${base.y + base.height}`,
        `${base.x + base.width},${base.y + base.height}`,
        // Top edge of front face (top front edge) 
        `${top.x + top.width},${top.y + top.height}`,
        `${top.x},${top.y + top.height}`
      ].join(' ')
    };

    // Right face: connects the right edges of base and top
    const right = {
      points: [
        // Right edge of base (bottom to top of right side)
        `${base.x + base.width},${base.y + base.height}`,
        `${base.x + base.width},${base.y}`,
        // Right edge of top (top to bottom of right side)
        `${top.x + top.width},${top.y}`,
        `${top.x + top.width},${top.y + top.height}`
      ].join(' ')
    };

    return { base, top, front, right };
  }, [pxSize, isometric, height, volumeOffsets]);

  // Calculate final viewbox size for 3D volumes
  const finalViewboxSize = useMemo(() => {
    if (!isometric || height <= 0) {
      return pxSize;
    }
    return {
      width: pxSize.width + volumeOffsets.depthOffsetX,
      height: pxSize.height + volumeOffsets.heightOffset
    };
  }, [pxSize, isometric, height, volumeOffsets]);

  return (
    <Svg viewboxSize={finalViewboxSize} style={finalCss}>
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

      {/* Base/floor face - slightly transparent foundation */}
      <rect
        x={volumeFaces.base?.x || 0}
        y={volumeFaces.base?.y || 0}
        width={pxSize.width}
        height={pxSize.height}
        fill={fillValue}
        rx={0}
        opacity={height > 0 && isometric ? 0.3 : 1.0}
        {...strokeParams}
      />

      {height > 0 && isometric && volumeFaces.front && volumeFaces.right && volumeFaces.top && (
        <>
          {/* Front wall - medium brightness */}
          <polygon
            points={volumeFaces.front.points}
            fill={fillValue}
            opacity={1.0}
            {...strokeParams}
            style={{ filter: 'brightness(0.7)' }}
          />

          {/* Right wall - darker for depth perception */}
          <polygon
            points={volumeFaces.right.points}
            fill={fillValue}
            opacity={1.0}
            {...strokeParams}
            style={{ filter: 'brightness(0.5)' }}
          />

          {/* Top face - brightest and fully opaque */}
          <rect
            x={volumeFaces.top.x}
            y={volumeFaces.top.y}
            width={volumeFaces.top.width}
            height={volumeFaces.top.height}
            fill={fillValue}
            rx={0}
            opacity={1.0}
            {...strokeParams}
          />
        </>
      )}

      {/* For non-isometric mode with height, just show elevated rectangle */}
      {height > 0 && !isometric && (
        <rect
          x={0}
          y={-volumeOffsets.heightOffset}
          width={pxSize.width}
          height={pxSize.height}
          fill={fillValue}
          rx={0}
          {...strokeParams}
        />
      )}
    </Svg>
  );
};