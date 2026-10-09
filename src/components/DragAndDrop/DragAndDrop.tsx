import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { getTilePosition } from 'src/utils';
import { useIcon } from 'src/hooks/useIcon';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  iconId: string;
}

export const DragAndDrop = ({ iconId }: Props) => {
  const { iconComponent } = useIcon(iconId);
  // Subscribed here rather than in the overlay so that only this preview follows the mouse
  const tile = useUiStateStore((state) => {
    return state.mouse.position.tile;
  });

  const tilePosition = useMemo(() => {
    return getTilePosition({ tile, origin: 'BOTTOM' });
  }, [tile]);

  return (
    <Box
      sx={{
        position: 'absolute'
      }}
      style={{ left: tilePosition.x, top: tilePosition.y }}
    >
      {iconComponent}
    </Box>
  );
};
