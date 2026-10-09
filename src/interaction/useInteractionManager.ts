import {useCallback, useEffect, useRef} from 'react';
import {useModelStore} from 'src/stores/modelStore';
import {useUiStateStore, useUiStateStoreApi} from 'src/stores/uiStateStore';
import {ModeActions, SlimMouseEvent, State} from 'src/types';
import {getItemAtTile, getMouse} from 'src/utils';
import {useResizeObserver} from 'src/hooks/useResizeObserver';
import {useScene} from 'src/hooks/useScene';
import {Cursor} from './modes/Cursor';
import {DragItems} from './modes/DragItems';
import {DrawRectangle} from './modes/Rectangle/DrawRectangle';
import {TransformRectangle} from './modes/Rectangle/TransformRectangle';
import {Connector} from './modes/Connector';
import {Pan} from './modes/Pan';
import {PlaceIcon} from './modes/PlaceIcon';
import {PlaceImage} from './modes/PlaceImage';
import {TextBox} from './modes/TextBox';

const modes: { [k in string]: ModeActions } = {
  CURSOR: Cursor,
  DRAG_ITEMS: DragItems,
  // TODO: Adopt this notation for all modes (i.e. {node.type}.{action})
  'RECTANGLE.DRAW': DrawRectangle,
  'RECTANGLE.TRANSFORM': TransformRectangle,
  CONNECTOR: Connector,
  PAN: Pan,
  PLACE_ICON: PlaceIcon,
    PLACE_IMAGE: PlaceImage,
  TEXTBOX: TextBox
};

const getModeFunction = (mode: ModeActions, e: SlimMouseEvent) => {
  switch (e.type) {
    case 'mousemove':
      return mode.mousemove;
    case 'mousedown':
      return mode.mousedown;
    case 'mouseup':
      return mode.mouseup;
    default:
      return null;
  }
};

export const useInteractionManager = () => {
  const rendererRef = useRef<HTMLElement>();
  const reducerTypeRef = useRef<string>();
  // Read the UI state at event time rather than subscribing to it: subscribing to the whole
  // state re-rendered the renderer (and every scene element) on each mouse move.
  const uiStateStore = useUiStateStoreApi();
  const modeType = useUiStateStore((state) => {
    return state.mode.type;
  });
  const editorMode = useUiStateStore((state) => {
    return state.editorMode;
  });
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });
  const modelActions = useModelStore((state) => {
    return state.actions;
  });
  const scene = useScene();
  const { size: rendererSize } = useResizeObserver(rendererEl);

  const onMouseEvent = useCallback(
    (e: SlimMouseEvent) => {
      if (!rendererRef.current) return;

      const uiState = uiStateStore.getState();
      const model = modelActions.get();

      const mode = modes[uiState.mode.type];
      const modeFunction = getModeFunction(mode, e);

      if (!modeFunction) return;

      const nextMouse = getMouse({
        interactiveElement: rendererRef.current,
        zoom: uiState.zoom,
        scroll: uiState.scroll,
        lastMouse: uiState.mouse,
        mouseEvent: e,
        rendererSize
      });

      uiState.actions.setMouse(nextMouse);

      const baseState: State = {
        model,
        scene,
        uiState,
        rendererRef: rendererRef.current,
        rendererSize,
        isRendererInteraction: rendererRef.current === e.target
      };

      if (reducerTypeRef.current !== uiState.mode.type) {
        const prevReducer = reducerTypeRef.current
          ? modes[reducerTypeRef.current]
          : null;

        if (prevReducer && prevReducer.exit) {
          prevReducer.exit(baseState);
        }

        if (mode.entry) {
          mode.entry(baseState);
        }
      }

      modeFunction(baseState);
      reducerTypeRef.current = uiState.mode.type;
    },
    [modelActions, scene, uiStateStore, rendererSize]
  );

  const onContextMenu = useCallback(
    (e: SlimMouseEvent) => {
      const uiState = uiStateStore.getState();

      e.preventDefault();

        // Disable right-click during readonly mode
        if (uiState.editorMode === 'EXPLORABLE_READONLY') {
            return;
        }

      const itemAtTile = getItemAtTile({
        tile: uiState.mouse.position.tile,
        scene
      });

      if (itemAtTile?.type === 'RECTANGLE') {
        uiState.actions.setContextMenu({
          item: itemAtTile,
            tile: uiState.mouse.position.tile,
            position: {x: e.clientX, y: e.clientY}
        });
      } else {
        // Show context menu for empty space
        uiState.actions.setContextMenu({
            tile: uiState.mouse.position.tile,
            position: {x: e.clientX, y: e.clientY}
        });
      }
    },
      [scene, uiStateStore]
  );

  useEffect(() => {
    if (modeType === 'INTERACTIONS_DISABLED') return;

    const uiStateActions = uiStateStore.getState().actions;

    const el = window;

    const onTouchStart = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: Math.floor(e.touches[0].clientX),
        clientY: Math.floor(e.touches[0].clientY),
        type: 'mousedown',
        button: 0
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: Math.floor(e.touches[0].clientX),
        clientY: Math.floor(e.touches[0].clientY),
        type: 'mousemove',
        button: 0
      });
    };

    const onTouchEnd = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: 0,
        clientY: 0,
        type: 'mouseup',
        button: 0
      });
    };

    const onScroll = (e: WheelEvent) => {
        // Get mouse position relative to the renderer element
        const rect = rendererRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
      
      if (e.deltaY > 0) {
          uiStateActions.decrementZoomAtPosition(mousePosition, rendererSize);
      } else {
          uiStateActions.incrementZoomAtPosition(mousePosition, rendererSize);
      }
    };

    el.addEventListener('mousemove', onMouseEvent);
    el.addEventListener('mousedown', onMouseEvent);
    el.addEventListener('mouseup', onMouseEvent);
    el.addEventListener('contextmenu', onContextMenu);
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);
    rendererRef.current?.addEventListener('wheel', onScroll);

    return () => {
      el.removeEventListener('mousemove', onMouseEvent);
      el.removeEventListener('mousedown', onMouseEvent);
      el.removeEventListener('mouseup', onMouseEvent);
      el.removeEventListener('contextmenu', onContextMenu);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      rendererRef.current?.removeEventListener('wheel', onScroll);
    };
  }, [
    editorMode,
    onMouseEvent,
    modeType,
    onContextMenu,
    uiStateStore,
    rendererEl,
    rendererSize
  ]);

  const setInteractionsElement = useCallback((element: HTMLElement) => {
    rendererRef.current = element;
  }, []);

  return {
    setInteractionsElement
  };
};
