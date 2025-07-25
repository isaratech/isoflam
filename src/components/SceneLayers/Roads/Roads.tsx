import React, { useMemo } from 'react';
import type { useScene } from 'src/hooks/useScene';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { Road } from './Road';

interface Props {
  roads: ReturnType<typeof useScene>['roads'];
}

export const Roads = ({ roads }: Props) => {
  const itemControls = useUiStateStore((state) => {
    return state.itemControls;
  });

  const mode = useUiStateStore((state) => {
    return state.mode;
  });

  const selectedRoadId = useMemo(() => {
    if (mode.type === 'ROAD') {
      return mode.id;
    }
    if (itemControls?.type === 'ROAD') {
      return itemControls.id;
    }

    return null;
  }, [mode, itemControls]);

  return (
    <>
      {[...roads].reverse().map((road) => {
        return (
          <Road
            key={road.id}
            road={road}
            isSelected={selectedRoadId === road.id}
          />
        );
      })}
    </>
  );
};