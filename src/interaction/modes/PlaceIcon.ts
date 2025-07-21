import {produce} from 'immer';
import {Icon, ModeActions, PlaceIconMode} from 'src/types';
import {generateId, getItemAtTile} from 'src/utils';
import {VIEW_ITEM_DEFAULTS} from 'src/config';

export const PlaceIcon: ModeActions = {
  mousemove: () => {},
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'PLACE_ICON' || !isRendererInteraction) return;

    const mode = uiState.mode as PlaceIconMode;
    if (!mode.id) {
      const itemAtTile = getItemAtTile({
        tile: uiState.mouse.position.tile,
        scene
      });

      uiState.actions.setMode({
        type: 'CURSOR',
        mousedownItem: itemAtTile,
        showCursor: true
      });

      uiState.actions.setItemControls(null);
    }
  },
  mouseup: ({ uiState, scene, model }) => {
    if (uiState.mode.type !== 'PLACE_ICON') return;

    const mode = uiState.mode as PlaceIconMode;
    if (mode.id !== null) {
      const modelItemId = generateId();

      scene.createModelItem({
        id: modelItemId,
        name: '',
        icon: mode.id
      });

      // Get the icon to check if it's colorizable
        const icon = model.icons?.find((i: Icon) => {
        return i.id === mode.id;
      });
      const isColorizable = icon?.colorizable !== false;

      // Get the first color from the colors list for colorizable icons
      const firstColor =
          scene.colors && scene.colors.length > 0 ? scene.colors[0].id : undefined;
      const defaultColor =
        isColorizable && firstColor ? firstColor : VIEW_ITEM_DEFAULTS.color;

      scene.createViewItem({
        ...VIEW_ITEM_DEFAULTS,
        id: modelItemId,
        tile: uiState.mouse.position.tile,
        scaleFactor: undefined,
        color: defaultColor
      });
    }

    uiState.actions.setMode(
      produce(mode, (draft) => {
        draft.id = null;
      })
    );
  }
};
