import {useCallback, useEffect, useRef} from 'react';
import {useModelStore} from 'src/stores/modelStore';
import {useUiStateStore, useUiStateStoreApi} from 'src/stores/uiStateStore';
import {ModeActions, SlimMouseEvent, State} from 'src/types';
import {getItemsAtTile, getMouse} from 'src/utils';
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
      // Leave the native context menu everywhere but on the canvas (text fields, panels, host page)
      if (!rendererRef.current || e.target !== rendererRef.current) return;

      const uiState = uiStateStore.getState();

      e.preventDefault();

        // Disable right-click during readonly mode
        if (uiState.editorMode === 'EXPLORABLE_READONLY') {
            return;
        }

      const itemsAtTile = getItemsAtTile({
        tile: uiState.mouse.position.tile,
        scene
      });
      // Layer ordering applies to every kind of item; prefer the selected one when it is under
      // the cursor (e.g. a zone selected through the icon on top of it)
      const { itemControls } = uiState;
      const itemAtTile =
        itemsAtTile.find((item) => {
          return (
            itemControls !== null &&
            itemControls.type === item.type &&
            'id' in itemControls &&
            itemControls.id === item.id
          );
        }) ?? itemsAtTile[0];

      if (itemAtTile) {
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

    // Touch is translated into left-button mouse events. Spreading the event doesn't copy
    // `target` (a prototype getter), so it is passed explicitly.
    const toMouseEvent = (
      e: TouchEvent,
      touch: Touch,
      type: SlimMouseEvent['type']
    ): SlimMouseEvent => {
      return {
        ...e,
        target: e.target,
        clientX: Math.floor(touch.clientX),
        clientY: Math.floor(touch.clientY),
        type,
        button: 0
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.target === rendererRef.current) {
        // Prevents the emulated mouse events that browsers send after a tap
        e.preventDefault();
      }

      // Move the pointer to the touch position first, so that the jump from the previous touch
      // isn't taken as a drag
      onMouseEvent(toMouseEvent(e, e.touches[0], 'mousemove'));
      onMouseEvent(toMouseEvent(e, e.touches[0], 'mousedown'));
    };

    const onTouchMove = (e: TouchEvent) => {
      onMouseEvent(toMouseEvent(e, e.touches[0], 'mousemove'));
    };

    const onTouchEnd = (e: TouchEvent) => {
      // `touches` is empty once the finger is lifted: use the touch that ended
      onMouseEvent(toMouseEvent(e, e.changedTouches[0], 'mouseup'));
    };

    let wheelDelta = 0;

    const onScroll = (e: WheelEvent) => {
        // Get mouse position relative to the renderer element
        const rect = rendererRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Don't let the browser zoom the page (trackpad pinch) or scroll the host page
        e.preventDefault();

        // Horizontal scrolling is not a zoom gesture
        if (e.deltaY === 0) return;

        // Trackpads send many small deltas: accumulate them so one gesture doesn't jump from min
        // to max zoom. A mouse wheel notch (~100px, or 1 line in Firefox) still zooms one step.
        wheelDelta += e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY : e.deltaY * 100;
        if (Math.abs(wheelDelta) < 50) return;

        const isZoomOut = wheelDelta > 0;
        wheelDelta = 0;

        const mousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
      
      if (isZoomOut) {
          uiStateActions.decrementZoomAtPosition(mousePosition, rendererSize);
      } else {
          uiStateActions.incrementZoomAtPosition(mousePosition, rendererSize);
      }
    };

    el.addEventListener('mousemove', onMouseEvent);
    el.addEventListener('mousedown', onMouseEvent);
    el.addEventListener('mouseup', onMouseEvent);
    el.addEventListener('contextmenu', onContextMenu);
    // Not passive, so that touchstart can cancel the emulated mouse events
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);
    rendererRef.current?.addEventListener('wheel', onScroll, { passive: false });

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
