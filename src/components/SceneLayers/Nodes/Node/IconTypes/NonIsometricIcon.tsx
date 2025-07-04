import React from 'react';
import { Box } from '@mui/material';
import { Icon } from 'src/types';
import { PROJECTED_TILE_SIZE } from 'src/config';
import { getIsoProjectionCss } from 'src/utils';

interface Props {
  icon: Icon;
  scaleFactor?: number;
  mirrorHorizontal?: boolean;
  mirrorVertical?: boolean;
}

export const NonIsometricIcon = ({
  icon,
  scaleFactor: propScaleFactor,
  mirrorHorizontal = false,
  mirrorVertical = false
}: Props) => {
  const scaleFactor = propScaleFactor ?? icon.scaleFactor ?? 1;

  // Calculate the scaled width to maintain centering
  const scaledWidth = PROJECTED_TILE_SIZE.width * 0.7 * scaleFactor;
  const baseWidth = PROJECTED_TILE_SIZE.width * 0.7;
  const widthDifference = (scaledWidth - baseWidth) / 2;

  // Create transform string for mirroring
  const getMirrorTransform = () => {
    let transform = '';
    if (mirrorHorizontal) transform += 'scaleX(-1) ';
    if (mirrorVertical) transform += 'scaleY(-1) ';
    return transform.trim();
  };

  return (
    <Box sx={{ pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'absolute',
          left: -PROJECTED_TILE_SIZE.width / 2 - widthDifference,
          top: -PROJECTED_TILE_SIZE.height / 2,
          transformOrigin: 'top left',
          transform: getIsoProjectionCss()
        }}
      >
        <Box
          component="img"
          src={icon.url}
          alt={icon.name || 'Non-isometric icon'}
          sx={{
            width: scaledWidth,
            display: 'block',
            margin: '0 auto',
            transform: getMirrorTransform(),
            transformOrigin: 'center'
          }}
        />
      </Box>
    </Box>
  );
};
