import { produce } from 'immer';
import {
  generateId,
  getItemAtTile,
  getItemByIdOrThrow,
  hasMovedTile,
  setWindowCursor
} from 'src/utils';
import { Connector as ConnectorI, ConnectorMode, ModeActions } from 'src/types';
import { DEFAULT_WALL_HEIGHT } from 'src/config';

const presetProperties: Record<
  NonNullable<ConnectorMode['preset']>,
  Partial<ConnectorI>
> = {
  WALL: { height: DEFAULT_WALL_HEIGHT, width: 20, showTriangle: false },
  ROAD: { variant: 'ROAD', showTriangle: false }
};

export const Connector: ModeActions = {
  entry: () => {
    setWindowCursor('crosshair');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'CONNECTOR' ||
      !uiState.mode.id ||
      !hasMovedTile(uiState.mouse)
    )
      return;

    const connector = getItemByIdOrThrow(
      scene.currentView?.connectors ?? [],
      uiState.mode.id
    );

    // Walls and roads are drawn freely on the ground, they don't stick to icons
    const itemAtTile = uiState.mode.preset
      ? null
      : getItemAtTile({
          tile: uiState.mouse.position.tile,
          scene
        });

    if (itemAtTile?.type === 'ITEM') {
      const newConnector = produce(connector.value, (draft) => {
        draft.anchors[1] = { id: generateId(), ref: { item: itemAtTile.id } };
      });

      scene.updateConnector(uiState.mode.id, newConnector);
    } else {
      const newConnector = produce(connector.value, (draft) => {
        draft.anchors[1] = {
          id: generateId(),
          ref: { tile: uiState.mouse.position.tile }
        };
      });

      scene.updateConnector(uiState.mode.id, newConnector);
    }
  },
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'CONNECTOR' || !isRendererInteraction) return;

    const { preset } = uiState.mode;
    // Walls default to the second colour (grey in the default palette), like rectangles
    const colorIndex = preset === 'WALL' ? 1 : 0;
    const newConnector: ConnectorI = {
      id: generateId(),
      color: scene.colors?.[colorIndex]?.id ?? scene.colors?.[0]?.id,
      anchors: [],
      ...(preset && presetProperties[preset])
    };

    const itemAtTile = preset
      ? null
      : getItemAtTile({
          tile: uiState.mouse.position.tile,
          scene
        });

    if (itemAtTile && itemAtTile.type === 'ITEM') {
      newConnector.anchors = [
        { id: generateId(), ref: { item: itemAtTile.id } },
        { id: generateId(), ref: { item: itemAtTile.id } }
      ];
    } else {
      newConnector.anchors = [
        { id: generateId(), ref: { tile: uiState.mouse.position.tile } },
        { id: generateId(), ref: { tile: uiState.mouse.position.tile } }
      ];
    }

    scene.createConnector(newConnector);

    uiState.actions.setMode({
      type: 'CONNECTOR',
      showCursor: true,
      id: newConnector.id,
      preset
    });
  },
  mouseup: ({ uiState, scene }) => {
    if (uiState.mode.type !== 'CONNECTOR' || !uiState.mode.id) return;

    const connector = getItemByIdOrThrow(scene.connectors, uiState.mode.id);
    const firstAnchor = connector.value.anchors[0];
    const lastAnchor =
      connector.value.anchors[connector.value.anchors.length - 1];

    // A link must join two icons; walls and roads only need some length
    const isLinkingIcons = Boolean(firstAnchor.ref.item && lastAnchor.ref.item);

    if (
      connector.value.path.tiles.length < 2 ||
      (!uiState.mode.preset && !isLinkingIcons)
    ) {
      scene.deleteConnector(uiState.mode.id);
    }

    uiState.actions.setMode({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  }
};
