import {ModeActions} from 'src/types';
import {produce} from 'immer';
import {generateId, setWindowCursor} from 'src/utils';

export const TransformVolume: ModeActions = {
  entry: () => {
    setWindowCursor('grab');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'VOLUME.TRANSFORM' ||
      !uiState.mode.selectedAnchor ||
      !uiState.mouse.mousedown
    )
      return;

    const volumeId = uiState.mode.id;
    const mousePosition = uiState.mouse.position.tile;

    // Transform the volume based on the selected anchor
    // This is a simplified version - in a full implementation you'd handle each anchor position
    scene.updateVolume(volumeId, {
      to: mousePosition
    });
  },
  mousedown: ({ uiState }) => {
    if (uiState.mode.type !== 'VOLUME.TRANSFORM') return;
    
    setWindowCursor('grabbing');
  },
  mouseup: ({ uiState }) => {
    if (uiState.mode.type !== 'VOLUME.TRANSFORM') return;

    setWindowCursor('grab');
    
    // Reset selected anchor after transformation
    const newMode = produce(uiState.mode, (draft) => {
      draft.selectedAnchor = null;
    });

    uiState.actions.setMode(newMode);
  }
};