import { Coords, DrawRectangleMode, ModeActions, Rectangle } from 'src/types';
import { produce } from 'immer';
import { generateId, hasMovedTile, setWindowCursor } from 'src/utils';
import { DEFAULT_VOLUME_HEIGHT, DEFAULT_WALL_HEIGHT } from 'src/config';

const presetProperties: Record<
  NonNullable<DrawRectangleMode['preset']>,
  Partial<Rectangle>
> = {
  VOLUME: { height: DEFAULT_VOLUME_HEIGHT, roof: true },
  WALL: { height: DEFAULT_WALL_HEIGHT, roof: true },
  ROAD: { texture: 'ROAD', radius: 0 }
};

// A wall is a straight, one-tile-thick line along the axis the mouse moved most on
export const getWallEnd = (from: Coords, mouse: Coords): Coords => {
  if (Math.abs(mouse.x - from.x) >= Math.abs(mouse.y - from.y)) {
    return { x: mouse.x, y: from.y };
  }

  return { x: from.x, y: mouse.y };
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

    const { id: rectangleId, preset } = uiState.mode;
    const rectangle = scene.rectangles.find(({ id }) => {
      return id === rectangleId;
    });
    if (!rectangle) return;

    scene.updateRectangle(rectangle.id, {
      to:
        preset === 'WALL'
          ? getWallEnd(rectangle.from, uiState.mouse.position.tile)
          : uiState.mouse.position.tile
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
