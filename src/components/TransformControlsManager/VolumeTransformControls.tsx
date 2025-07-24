import React, { useCallback } from 'react';
import { useVolume } from 'src/hooks/useVolume';
import { AnchorPosition } from 'src/types';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { TransformControls } from './TransformControls';

interface Props {
  id: string;
}

export const VolumeTransformControls = ({ id }: Props) => {
  const volume = useVolume(id);
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });

  const onAnchorMouseDown = useCallback(
    (key: AnchorPosition) => {
      uiStateActions.setMode({
        type: 'VOLUME.TRANSFORM',
        id: volume.id,
        selectedAnchor: key,
        showCursor: true
      });
    },
    [volume.id, uiStateActions]
  );

  return (
    <TransformControls
      from={volume.from}
      to={volume.to}
      onAnchorMouseDown={onAnchorMouseDown}
    />
  );
};