import React, { useMemo } from 'react';
import { Coords } from 'src/types';
import { Svg } from 'src/components/Svg/Svg';
import { useIsoProjection } from 'src/hooks/useIsoProjection';

interface Props {
  from: Coords;
  to: Coords;
  origin?: Coords;
  fill?: string;
  cornerRadius?: number;
  stroke?: {
    width: number;
    color: string;
    style?: 'SOLID' | 'DOTTED' | 'DASHED';
  };
}

export const IsoTileArea = ({
  from,
  to,
  fill = 'none',
  cornerRadius = 0,
  stroke
}: Props) => {
  const { css, pxSize } = useIsoProjection({
    from,
    to
  });

  const strokeParams = useMemo(() => {
    if (!stroke) return {};

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

  return (
    <Svg viewboxSize={pxSize} style={css}>
      <rect
        width={pxSize.width}
        height={pxSize.height}
        fill={fill}
        rx={cornerRadius}
        {...strokeParams}
      />
    </Svg>
  );
};
