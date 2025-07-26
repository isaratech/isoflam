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

    // Base face: using real world coordinates for points
    const baseRect = {
      x: 0,
      y: 0,
      width: pxSize.width,
      height: pxSize.height
    };
    
    const base = {
      rect: baseRect,
      points: [
        `${baseRect.x},${baseRect.y}`,                                  // Top-left
        `${baseRect.x + baseRect.width},${baseRect.y}`,                 // Top-right
        `${baseRect.x + baseRect.width},${baseRect.y + baseRect.height}`, // Bottom-right
        `${baseRect.x},${baseRect.y + baseRect.height}`                 // Bottom-left
      ].join(' ')
    };

    // Top face: using real world coordinates for points
    const topRect = {
      x: volumeOffsets.depthOffsetX,
      y: -volumeOffsets.heightOffset, // Pure vertical displacement (negative Y = up in screen coordinates)
      width: pxSize.width,
      height: pxSize.height
    };
    
    const top = {
      rect: topRect,
      points: [
        `${topRect.x},${topRect.y}`,                                  // Top-left
        `${topRect.x + topRect.width},${topRect.y}`,                 // Top-right
        `${topRect.x + topRect.width},${topRect.y + topRect.height}`, // Bottom-right
        `${topRect.x},${topRect.y + topRect.height}`                 // Bottom-left
      ].join(' ')
    };

    // Front face: connects the front edges of base and top
    const front = {
      points: [
        // Bottom edge of front face (base front edge)
        `${baseRect.x},${baseRect.y + baseRect.height}`,
        `${baseRect.x + baseRect.width},${baseRect.y + baseRect.height}`,
        // Top edge of front face (top front edge) 
        `${topRect.x + topRect.width},${topRect.y + topRect.height}`,
        `${topRect.x},${topRect.y + topRect.height}`
      ].join(' ')
    };

    // Right face: connects the right edges of base and top
    const right = {
      points: [
        // Right edge of base (bottom to top of right side)
        `${baseRect.x + baseRect.width},${baseRect.y + baseRect.height}`,
        `${baseRect.x + baseRect.width},${baseRect.y}`,
        // Right edge of top (top to bottom of right side)
        `${topRect.x + topRect.width},${topRect.y}`,
        `${topRect.x + topRect.width},${topRect.y + topRect.height}`
      ].join(' ')
    };

    // Debug console logs for volume face positions with real world coordinates, rect parameters, and CSS coordinates
    console.log('[DEBUG] Volume Face Positions:');
    
    // Base face debug info
    console.log('[DEBUG] Base Face:');
    console.log('  Real World Coordinates:', { 
      from, 
      to 
    });
    console.log('  Rect Parameters:', baseRect);
    console.log('  CSS Coordinates:', { 
      left: typeof css.left === 'number' ? css.left : String(css.left), 
      top: typeof css.top === 'number' ? css.top : String(css.top), 
      width: css.width, 
      height: css.height 
    });
    console.log('  Points:', base.points.split(' '));
    
    // Top face debug info
    console.log('[DEBUG] Top Face:');
    console.log('  Real World Coordinates:', { 
      from: { x: from.x, y: from.y, z: height }, 
      to: { x: to.x, y: to.y, z: height } 
    });
    console.log('  Rect Parameters:', topRect);
    
    // Safely calculate CSS coordinates for top face
    const topFaceCssLeft = typeof css.left === 'number' 
      ? css.left + volumeOffsets.depthOffsetX 
      : `${css.left} + ${volumeOffsets.depthOffsetX}px`;
      
    const topFaceCssTop = typeof css.top === 'number' 
      ? css.top - volumeOffsets.heightOffset 
      : `${css.top} - ${volumeOffsets.heightOffset}px`;
      
    console.log('  CSS Coordinates:', { 
      left: topFaceCssLeft, 
      top: topFaceCssTop, 
      width: css.width, 
      height: css.height 
    });
    console.log('  Points:', top.points.split(' '));
    
    // Front face debug info
    console.log('[DEBUG] Front Face:');
    console.log('  Real World Coordinates:', { 
      bottomLeft: { x: from.x, y: to.y, z: 0 },
      bottomRight: { x: to.x, y: to.y, z: 0 },
      topRight: { x: to.x, y: to.y, z: height },
      topLeft: { x: from.x, y: to.y, z: height }
    });
    console.log('  CSS Coordinates:', { 
      bottomLeft: { x: baseRect.x, y: baseRect.y + baseRect.height },
      bottomRight: { x: baseRect.x + baseRect.width, y: baseRect.y + baseRect.height },
      topRight: { x: topRect.x + topRect.width, y: topRect.y + topRect.height },
      topLeft: { x: topRect.x, y: topRect.y + topRect.height }
    });
    console.log('  Points:', front.points.split(' '));
    
    // Left face debug info (actually right face in the code)
    console.log('[DEBUG] Left Face:');
    console.log('  Real World Coordinates:', { 
      bottomLeft: { x: to.x, y: to.y, z: 0 },
      bottomRight: { x: to.x, y: from.y, z: 0 },
      topRight: { x: to.x, y: from.y, z: height },
      topLeft: { x: to.x, y: to.y, z: height }
    });
    console.log('  CSS Coordinates:', { 
      bottomLeft: { x: baseRect.x + baseRect.width, y: baseRect.y + baseRect.height },
      bottomRight: { x: baseRect.x + baseRect.width, y: baseRect.y },
      topRight: { x: topRect.x + topRect.width, y: topRect.y },
      topLeft: { x: topRect.x + topRect.width, y: topRect.y + topRect.height }
    });
    console.log('  Points:', right.points.split(' '));
    
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
      <polygon
        points={volumeFaces.base?.points || `0,0 ${pxSize.width},0 ${pxSize.width},${pxSize.height} 0,${pxSize.height}`}
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
          <polygon
            points={volumeFaces.top.points}
            fill={fillValue}
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