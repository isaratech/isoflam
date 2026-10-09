import { produce } from 'immer';
import {
  ConnectorAnchor,
  Coords,
  ItemControls,
  ItemReference,
  ModeActions,
  ModeActionsAction,
  SceneConnector,
  View
} from 'src/types';
import {
  connectorPathTileToGlobal,
  CoordsUtils,
  generateId,
  getAnchorAtTile,
  getAnchorTile,
  getConnectorGroundTile,
  getItemByIdOrThrow,
  getItemsAtTile,
  hasMovedTile,
  setWindowCursor
} from 'src/utils';
import { useScene } from 'src/hooks/useScene';

const getAnchorOrdering = (
  anchor: ConnectorAnchor,
  connector: SceneConnector,
  view: View
) => {
  // Guard against connectors with undefined paths
  if (!connector.path || !connector.path.tiles) {
    throw new Error(`Connector path is undefined [anchorId: ${anchor.id}]`);
  }

  const anchorTile = getAnchorTile(anchor, view);
  const index = connector.path.tiles.findIndex((pathTile) => {
    const globalTile = connectorPathTileToGlobal(
      pathTile,
      connector.path.rectangle.from
    );
    return CoordsUtils.isEqual(globalTile, anchorTile);
  });

  if (index === -1) {
    throw new Error(
      `Could not calculate ordering index of anchor [anchorId: ${anchor.id}]`
    );
  }

  return index;
};

const getAnchor = (
  connectorId: string,
  mouseTile: Coords,
  scene: ReturnType<typeof useScene>
) => {
  const connector = getItemByIdOrThrow(scene.connectors, connectorId).value;
  // The mouse can point anywhere on a wall: anchors stand at its foot
  const tile = getConnectorGroundTile(connector, mouseTile) ?? mouseTile;
  const anchor = getAnchorAtTile(tile, connector.anchors);

  if (!anchor) {
    const newAnchor: ConnectorAnchor = {
      id: generateId(),
      ref: { tile }
    };

    if (!scene.currentView) {
      return newAnchor;
    }

    const orderedAnchors = [...connector.anchors, newAnchor]
      .map((anch) => {
        return {
          ...anch,
          ordering: getAnchorOrdering(anch, connector, scene.currentView!)
        };
      })
      .sort((a, b) => {
        return a.ordering - b.ordering;
      });

    scene.updateConnector(connector.id, { anchors: orderedAnchors });
    return newAnchor;
  }

  return anchor;
};

const isSameItem = (
  item: ItemReference,
  other: ItemReference | ItemControls | null
) => {
  return Boolean(
    other && other.type === item.type && 'id' in other && other.id === item.id
  );
};

const mousedown: ModeActionsAction = ({
  uiState,
  scene,
  isRendererInteraction
}) => {
  if (uiState.mode.type !== 'CURSOR' || !isRendererInteraction) return;

  const itemsAtTile = getItemsAtTile({
    tile: uiState.mouse.position.tile,
    scene
  });
  // Prefer the selected item, so that an item reached by clicking through a stack can be dragged
  const selectedItem = itemsAtTile.find((item) => {
    return isSameItem(item, uiState.itemControls);
  });
  const itemAtTile = selectedItem ?? itemsAtTile[0];

  if (itemAtTile) {
    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        draft.mousedownItem = itemAtTile;
        draft.mousedownItemWasSelected = Boolean(selectedItem);
      })
    );

    uiState.actions.setItemControls(itemAtTile);
  } else {
    // If clicking on an empty cell, switch to PAN mode
    // Store the current mode to restore it when the drag stops
    uiState.actions.setMode({
      type: 'PAN',
      showCursor: false,
      previousMode: uiState.mode,
      isDragging: true
    });

    // Set the cursor to grabbing to indicate panning
    setWindowCursor('grabbing');

    uiState.actions.setItemControls(null);
  }
};

export const Cursor: ModeActions = {
  entry: (state) => {
    const { uiState } = state;

    if (uiState.mode.type !== 'CURSOR') return;

    if (uiState.mode.mousedownItem) {
      mousedown(state);
    }
  },
  mousemove: ({ scene, uiState }) => {
    if (uiState.mode.type !== 'CURSOR' || !hasMovedTile(uiState.mouse)) return;

    let item = uiState.mode.mousedownItem;
    let grabOffset: Coords | undefined;

    if (item?.type === 'CONNECTOR' && uiState.mouse.mousedown) {
      const { tile } = uiState.mouse.mousedown;
      const anchor = getAnchor(item.id, tile, scene);
      const connector = getItemByIdOrThrow(scene.connectors, item.id).value;
      const groundTile = getConnectorGroundTile(connector, tile) ?? tile;

      item = {
        type: 'CONNECTOR_ANCHOR',
        id: anchor.id
      };
      grabOffset = CoordsUtils.subtract(tile, groundTile);
    }

    if (item) {
      uiState.actions.setMode({
        type: 'DRAG_ITEMS',
        showCursor: true,
        items: [item],
        isInitialMovement: true,
        grabOffset
      });
    }
  },
  mousedown,
  mouseup: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'CURSOR' || !isRendererInteraction) return;

    const { mousedownItem, mousedownItemWasSelected } = uiState.mode;
    // Clicking again on the selected item selects the next one below it (stacked items, or a
    // zone under an icon). Reaching this point means the item was not dragged.
    const itemsAtTile =
      mousedownItemWasSelected && mousedownItem
        ? getItemsAtTile({ tile: uiState.mouse.position.tile, scene })
        : [];
    const clickedIndex = itemsAtTile.findIndex((item) => {
      return mousedownItem !== null && isSameItem(item, mousedownItem);
    });

    if (itemsAtTile.length > 1 && clickedIndex !== -1) {
      uiState.actions.setItemControls(
        itemsAtTile[(clickedIndex + 1) % itemsAtTile.length]
      );
    } else if (uiState.mode.mousedownItem) {
      if (uiState.mode.mousedownItem.type === 'ITEM') {
        uiState.actions.setItemControls({
          type: 'ITEM',
          id: uiState.mode.mousedownItem.id
        });
      } else if (uiState.mode.mousedownItem.type === 'RECTANGLE') {
        uiState.actions.setItemControls({
          type: 'RECTANGLE',
          id: uiState.mode.mousedownItem.id
        });
      } else if (uiState.mode.mousedownItem.type === 'CONNECTOR') {
        uiState.actions.setItemControls({
          type: 'CONNECTOR',
          id: uiState.mode.mousedownItem.id
        });
      } else if (uiState.mode.mousedownItem.type === 'TEXTBOX') {
        uiState.actions.setItemControls({
          type: 'TEXTBOX',
          id: uiState.mode.mousedownItem.id
        });
      }
    } else {
      uiState.actions.setItemControls(null);
    }

    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        draft.mousedownItem = null;
        draft.mousedownItemWasSelected = false;
      })
    );
  }
};
