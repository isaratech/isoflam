import {produce} from 'immer';
import {generateId, getItemAtTile, getItemByIdOrThrow, hasMovedTile, setWindowCursor} from 'src/utils';
import {Road as RoadI, ModeActions} from 'src/types';

export const Road: ModeActions = {
  entry: () => {
    setWindowCursor('crosshair');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'ROAD' ||
      !uiState.mode.id ||
      !hasMovedTile(uiState.mouse)
    )
      return;

    const road = getItemByIdOrThrow(
      scene.currentView?.roads ?? [],
      uiState.mode.id
    );

    const itemAtTile = getItemAtTile({
      tile: uiState.mouse.position.tile,
      scene
    });

    if (itemAtTile?.type === 'ITEM') {
      const newRoad = produce(road.value, (draft) => {
        draft.anchors[1] = { id: generateId(), ref: { item: itemAtTile.id } };
      });

      scene.updateRoad(uiState.mode.id, newRoad);
    } else {
      const newRoad = produce(road.value, (draft) => {
        draft.anchors[1] = {
          id: generateId(),
          ref: { tile: uiState.mouse.position.tile }
        };
      });

      scene.updateRoad(uiState.mode.id, newRoad);
    }
  },
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'ROAD' || !isRendererInteraction) return;

    const newRoad: RoadI = {
      id: generateId(),
      color: scene.colors && scene.colors.length > 0 ? scene.colors[0].id : undefined,
      width: 2, // Default width as per requirements
      anchors: []
    };

    const itemAtTile = getItemAtTile({
      tile: uiState.mouse.position.tile,
      scene
    });

    if (itemAtTile && itemAtTile.type === 'ITEM') {
      newRoad.anchors = [
        { id: generateId(), ref: { item: itemAtTile.id } },
        { id: generateId(), ref: { item: itemAtTile.id } }
      ];
    } else {
      newRoad.anchors = [
        { id: generateId(), ref: { tile: uiState.mouse.position.tile } },
        { id: generateId(), ref: { tile: uiState.mouse.position.tile } }
      ];
    }

    scene.createRoad(newRoad);

    uiState.actions.setMode({
      type: 'ROAD',
      showCursor: true,
      id: newRoad.id
    });
  },
  mouseup: ({ uiState, scene }) => {
    if (uiState.mode.type !== 'ROAD' || !uiState.mode.id) return;

    const road = getItemByIdOrThrow(scene.roads, uiState.mode.id);
    const firstAnchor = road.value.anchors[0];
    const lastAnchor =
      road.value.anchors[road.value.anchors.length - 1];

    if (
      road.value.path.tiles.length < 2 ||
      !(firstAnchor.ref.item && lastAnchor.ref.item)
    ) {
      scene.deleteRoad(uiState.mode.id);
    }

    uiState.actions.setMode({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  }
};