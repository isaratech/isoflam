import { DrawRectangleMode, ModeActions, Rectangle } from 'src/types';
import { produce } from 'immer';
import { generateId, hasMovedTile, setWindowCursor } from 'src/utils';

const presetProperties: Record<
  NonNullable<DrawRectangleMode['preset']>,
  Partial<Rectangle>
> = {
  BUILDING: { height: 2, roof: true, building: {} }
};

export const DrawRectangle: ModeActions = {
  entry: () => {
    setWindowCursor('crosshair');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'RECTANGLE.DRAW' ||
      !hasMovedTile(uiState.mouse) ||
      !uiState.mode.id ||
      !uiState.mouse.mousedown
    )
      return;

    scene.updateRectangle(uiState.mode.id, {
      to: uiState.mouse.position.tile
    });
  },
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'RECTANGLE.DRAW' || !isRendererInteraction)
      return;

    const newRectangleId = generateId();

    scene.createRectangle({
      id: newRectangleId,
      color:
        scene.colors && scene.colors.length > 1
          ? scene.colors[1].id
          : undefined,
      from: uiState.mouse.position.tile,
      to: uiState.mouse.position.tile,
      ...(uiState.mode.preset && presetProperties[uiState.mode.preset])
    });

    const newMode = produce(uiState.mode, (draft) => {
      draft.id = newRectangleId;
    });

    uiState.actions.setMode(newMode);
  },
  mouseup: ({ uiState }) => {
    if (uiState.mode.type !== 'RECTANGLE.DRAW' || !uiState.mode.id) return;

    uiState.actions.setMode({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  }
};
