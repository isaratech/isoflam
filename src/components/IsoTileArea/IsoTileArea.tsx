import React, {useMemo} from 'react';
import {Coords} from 'src/types';
import {Svg} from 'src/components/Svg/Svg';
import {useIsoProjection} from 'src/hooks/useIsoProjection';
import {UNPROJECTED_TILE_SIZE} from 'src/config';
import {getBoundingBox, getTilePosition} from 'src/utils';

interface Props {
  from: Coords;
  to: Coords;
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

export const IsoTileArea = ({
  from,
  to,
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

  return (
    <Svg viewboxSize={pxSize} style={css}>
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
      <rect
        width={pxSize.width}
        height={pxSize.height}
        fill={fillValue}
        rx={cornerRadius}
        {...strokeParams}
      />
    </Svg>
  );
};
