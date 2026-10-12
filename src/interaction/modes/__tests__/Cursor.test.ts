import { CursorMode, ItemReference } from 'src/types';
import { Cursor } from '../Cursor';

// A 3x3 zone and a wall running along (3,5) -> (0,5)
const getScene = ({ locked }: { locked: boolean }) => {
  const wallAnchors = [
    { id: 'start', ref: { tile: { x: 0, y: 5 } } },
    { id: 'end', ref: { tile: { x: 3, y: 5 } } }
  ];

  return {
    items: [],
    textBoxes: [],
    rectangles: [
      { id: 'zone', from: { x: 0, y: 0 }, to: { x: 2, y: 2 }, locked }
    ],
    connectors: [
      {
        id: 'wall',
        locked,
        anchors: wallAnchors,
        path: {
          tiles: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 }
          ],
          rectangle: { from: { x: 3, y: 5 }, to: { x: 0, y: 5 } }
        }
      }
    ],
    currentView: {
      items: [],
      connectors: [{ id: 'wall', anchors: wallAnchors }]
    },
    updateConnector: jest.fn()
  };
};

const getUiState = (mousedownItem: ItemReference | null) => {
  const mode: CursorMode = { type: 'CURSOR', showCursor: true, mousedownItem };

  return {
    mode,
    itemControls: null,
    mouse: {
      position: { screen: { x: 0, y: 0 }, tile: { x: 1, y: 1 } },
      mousedown: { screen: { x: 0, y: 0 }, tile: { x: 1, y: 1 } },
      delta: { screen: { x: 40, y: 0 }, tile: { x: 1, y: 0 } }
    },
    actions: {
      setMode: jest.fn(),
      setItemControls: jest.fn()
    }
  };
};

const run = (
  action: 'mousedown' | 'mousemove',
  scene: ReturnType<typeof getScene>,
  uiState: ReturnType<typeof getUiState>
) => {
  Cursor[action]!({
    scene,
    uiState,
    isRendererInteraction: true
  } as any);
};

describe('Cursor mode with locked items', () => {
  it('drags an unlocked rectangle', () => {
    const uiState = getUiState({ type: 'RECTANGLE', id: 'zone' });

    run('mousemove', getScene({ locked: false }), uiState);

    expect(uiState.actions.setMode).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'DRAG_ITEMS',
        items: [{ type: 'RECTANGLE', id: 'zone' }]
      })
    );
  });

  it('pans the view instead of dragging a locked rectangle', () => {
    const uiState = getUiState({ type: 'RECTANGLE', id: 'zone' });

    run('mousemove', getScene({ locked: true }), uiState);

    expect(uiState.actions.setMode).toHaveBeenCalledWith({
      type: 'PAN',
      showCursor: false,
      previousMode: { type: 'CURSOR', showCursor: true, mousedownItem: null },
      isDragging: true
    });
    expect(uiState.actions.setItemControls).toHaveBeenCalledWith(null);
  });

  it('adds a corner to an unlocked wall grabbed between its anchors', () => {
    const scene = getScene({ locked: false });
    const uiState = getUiState({ type: 'CONNECTOR', id: 'wall' });
    uiState.mouse.mousedown.tile = { x: 1, y: 5 };

    run('mousemove', scene, uiState);

    expect(scene.updateConnector).toHaveBeenCalled();
    expect(uiState.actions.setMode).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DRAG_ITEMS' })
    );
  });

  it('leaves a locked wall untouched', () => {
    const scene = getScene({ locked: true });
    const uiState = getUiState({ type: 'CONNECTOR', id: 'wall' });
    uiState.mouse.mousedown.tile = { x: 1, y: 5 };

    run('mousemove', scene, uiState);

    expect(scene.updateConnector).not.toHaveBeenCalled();
    expect(uiState.actions.setMode).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PAN' })
    );
  });

  it('selects an unlocked item as soon as it is pressed', () => {
    const uiState = getUiState(null);

    run('mousedown', getScene({ locked: false }), uiState);

    expect(uiState.actions.setItemControls).toHaveBeenCalledWith({
      type: 'RECTANGLE',
      id: 'zone'
    });
  });

  it('waits for the click to select a locked item, as pressing it may start a pan', () => {
    const uiState = getUiState(null);

    run('mousedown', getScene({ locked: true }), uiState);

    expect(uiState.actions.setMode).toHaveBeenCalledWith(
      expect.objectContaining({
        mousedownItem: { type: 'RECTANGLE', id: 'zone' }
      })
    );
    expect(uiState.actions.setItemControls).not.toHaveBeenCalled();
  });
});
