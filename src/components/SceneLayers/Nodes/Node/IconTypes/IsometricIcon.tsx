import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { PROJECTED_TILE_SIZE } from 'src/config';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { Icon } from 'src/types';

interface Props {
  icon: Icon;
  onImageLoaded?: () => void;
  scaleFactor?: number;
}

export const IsometricIcon = ({ icon, onImageLoaded, scaleFactor: propScaleFactor }: Props) => {
  const ref = useRef();
  const { size, observe, disconnect } = useResizeObserver();
  const scaleFactor = propScaleFactor ?? icon.scaleFactor ?? 1;

  useEffect(() => {
    if (!ref.current) return;

    observe(ref.current);

    return disconnect;
  }, [observe, disconnect]);

  // Calculate expected dimensions based on scale factor for consistent centering
  const expectedWidth = PROJECTED_TILE_SIZE.width * 0.8 * scaleFactor;

  return (
    <Box
      ref={ref}
      component="img"
      onLoad={onImageLoaded}
      src={icon.url}
      sx={{
        position: 'absolute',
        width: expectedWidth,
        top: -size.height,
        left: -expectedWidth / 2,
        pointerEvents: 'none'
      }}
    />
  );
};
