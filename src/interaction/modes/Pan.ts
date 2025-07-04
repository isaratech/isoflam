import { produce } from 'immer';
import { CoordsUtils, setWindowCursor } from 'src/utils';
import { ModeActions } from 'src/types';

export const Pan: ModeActions = {
  entry: () => {
    setWindowCursor('grab');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState }) => {
    // Allow panning with middle mouse button even when not in PAN mode
    const isMiddleMouseDown = uiState.mouse.mousedown?.button === 1;
    const isPanMode = uiState.mode.type === 'PAN';

    if (!isPanMode && !isMiddleMouseDown) return;

    if (uiState.mouse.mousedown !== null) {
      const newScroll = produce(uiState.scroll, (draft) => {
        draft.position = uiState.mouse.delta?.screen
          ? CoordsUtils.add(draft.position, uiState.mouse.delta.screen)
          : draft.position;
      });

      uiState.actions.setScroll(newScroll);
    }
  },
  mousedown: ({ uiState, isRendererInteraction }) => {
    // Allow panning with middle mouse button even when not in PAN mode
    const isMiddleMouseButton = uiState.mouse.mousedown?.button === 1;
    const isPanMode = uiState.mode.type === 'PAN';

    if ((!isPanMode && !isMiddleMouseButton) || !isRendererInteraction) return;

    setWindowCursor('grabbing');
  },
  mouseup: ({ uiState }) => {
    // Only handle if we're in PAN mode
    if (uiState.mode.type === 'PAN') {
      // If we have a previous mode stored, restore it
      if (uiState.mode.previousMode) {
        uiState.actions.setMode(uiState.mode.previousMode);
      } else {
        // Default to CURSOR mode if no previous mode
        uiState.actions.setMode({
          type: 'CURSOR',
          showCursor: true,
          mousedownItem: null
        });
      }
    } else {
      setWindowCursor('default');
    }
  }
};
