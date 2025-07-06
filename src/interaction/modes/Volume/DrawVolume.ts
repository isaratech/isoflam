import { ModeActions } from 'src/types';
import { produce } from 'immer';
import { generateId, hasMovedTile, setWindowCursor } from 'src/utils';

export const DrawVolume: ModeActions = {
  entry: () => {
    setWindowCursor('crosshair');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'VOLUME.DRAW' ||
      !hasMovedTile(uiState.mouse) ||
      !uiState.mode.id ||
      !uiState.mouse.mousedown
    )
      return;

    scene.updateVolume(uiState.mode.id, {
      to: uiState.mouse.position.tile
    });
  },
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'VOLUME.DRAW' || !isRendererInteraction)
      return;

    const newVolumeId = generateId();

    scene.createVolume({
      id: newVolumeId,
      color: scene.colors[1].id,
      from: uiState.mouse.position.tile,
      to: uiState.mouse.position.tile,
      height: 1,
      hasRoof: true
    });

    const newMode = produce(uiState.mode, (draft) => {
      draft.id = newVolumeId;
    });

    uiState.actions.setMode(newMode);
  },
  mouseup: ({ uiState }) => {
    if (uiState.mode.type !== 'VOLUME.DRAW' || !uiState.mode.id) return;

    uiState.actions.setMode({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  }
};