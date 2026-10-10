import { produce } from 'immer';
import { ItemReference, LayerOrderingAction } from 'src/types';
import { getItemByIdOrThrow } from 'src/utils';
import { State, ViewReducerContext } from './types';

export const changeLayerOrder = (
  { action, item }: { action: LayerOrderingAction; item: ItemReference },
  { viewId, state }: ViewReducerContext
): State => {
  const newState = produce(state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, viewId);

    // Icons are drawn by depth, so their list order wouldn't show: they get a layer instead
    if (item.type === 'ITEM') {
      const target = getItemByIdOrThrow(view.value.items, item.id).value;
      const otherLayers = view.value.items
        .filter(({ id }) => {
          return id !== item.id;
        })
        .map(({ layer }) => {
          return layer ?? 0;
        });
      const layer = target.layer ?? 0;

      switch (action) {
        case 'BRING_FORWARD':
          target.layer = layer + 1;
          break;
        case 'SEND_BACKWARD':
          target.layer = layer - 1;
          break;
        case 'BRING_TO_FRONT':
          target.layer = Math.max(layer, Math.max(0, ...otherLayers) + 1);
          break;
        case 'SEND_TO_BACK':
          target.layer = Math.min(layer, Math.min(0, ...otherLayers) - 1);
          break;
        default:
          break;
      }
      return;
    }

    let arr: any[];

    switch (item.type) {
      case 'RECTANGLE':
        arr = view.value.rectangles ?? [];
        break;
      case 'TEXTBOX':
        arr = view.value.textBoxes ?? [];
        break;
      case 'CONNECTOR':
        arr = view.value.connectors ?? [];
        break;
      default:
        throw new Error('Invalid item type');
    }

    const target = getItemByIdOrThrow(arr, item.id);

    if (action === 'SEND_BACKWARD' && target.index < arr.length - 1) {
      arr.splice(target.index, 1);
      arr.splice(target.index + 1, 0, target.value);
    } else if (action === 'SEND_TO_BACK' && target.index !== arr.length - 1) {
      arr.splice(target.index, 1);
      arr.splice(arr.length, 0, target.value);
    } else if (action === 'BRING_FORWARD' && target.index > 0) {
      arr.splice(target.index, 1);
      arr.splice(target.index - 1, 0, target.value);
    } else if (action === 'BRING_TO_FRONT' && target.index !== 0) {
      arr.splice(target.index, 1);
      arr.splice(0, 0, target.value);
    }
  });

  return newState;
};
