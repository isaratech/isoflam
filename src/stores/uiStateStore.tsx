import React, {createContext, useContext, useRef} from 'react';
import {createStore, useStore} from 'zustand';
import {CoordsUtils, decrementZoom, getStartingMode, incrementZoom, screenToIso} from 'src/utils';
import {UiStateStore} from 'src/types';
import {INITIAL_UI_STATE, PROJECTED_TILE_SIZE} from 'src/config';
import {SupportedLanguage} from 'src/hooks/useTranslation';

const initialState = () => {
  return createStore<UiStateStore>((set, get) => {
    return {
      zoom: INITIAL_UI_STATE.zoom,
      scroll: INITIAL_UI_STATE.scroll,
      view: '',
      mainMenuOptions: [],
      editorMode: 'EDITABLE',
      mode: getStartingMode('EDITABLE'),
      iconCategoriesState: [],
      isMainMenuOpen: false,
      dialog: null,
      rendererEl: null,
      contextMenu: null,
      language: 'fr' as SupportedLanguage,
      mouse: {
        position: { screen: CoordsUtils.zero(), tile: CoordsUtils.zero() },
        mousedown: null,
        delta: null
      },
      itemControls: null,
      enableDebugTools: false,
        hasUnsavedChanges: false,
      actions: {
        setView: (view) => {
          set({ view });
        },
        setMainMenuOptions: (mainMenuOptions) => {
          set({ mainMenuOptions });
        },
        setEditorMode: (mode) => {
          set({ editorMode: mode, mode: getStartingMode(mode) });
        },
        setIconCategoriesState: (iconCategoriesState) => {
          set({ iconCategoriesState });
        },
        setLanguage: (language: SupportedLanguage) => {
          set({ language });
        },
        resetUiState: () => {
          set({
            mode: getStartingMode(get().editorMode),
            scroll: {
              position: CoordsUtils.zero(),
              offset: CoordsUtils.zero()
            },
            itemControls: null,
            zoom: 1
          });
        },
        setMode: (mode) => {
          set({ mode });
        },
        setDialog: (dialog) => {
          set({ dialog });
        },
        setIsMainMenuOpen: (isMainMenuOpen) => {
          set({ isMainMenuOpen, itemControls: null });
        },
        incrementZoom: () => {
          const { zoom } = get();
          set({ zoom: incrementZoom(zoom) });
        },
        decrementZoom: () => {
          const { zoom } = get();
          set({ zoom: decrementZoom(zoom) });
        },
          incrementZoomAtPosition: (screenPosition: { x: number; y: number }, rendererSize: { width: number; height: number }) => {
              const state = get();
              const oldZoom = state.zoom;
              const newZoom = incrementZoom(oldZoom);

              if (oldZoom === newZoom) return; // No zoom change

              // Calculate the tile position at the mouse cursor before zoom
              const tileBeforeZoom = screenToIso({
                  mouse: screenPosition,
                  zoom: oldZoom,
                  scroll: state.scroll,
                  rendererSize
              });

              // Calculate where this tile would appear on screen after zoom with new zoom level
              // We need to reverse the screenToIso calculation with the new zoom
              const projectedTileSize = {
                  width: PROJECTED_TILE_SIZE.width * newZoom,
                  height: PROJECTED_TILE_SIZE.height * newZoom
              };
              const halfW = projectedTileSize.width / 2;
              const halfH = projectedTileSize.height / 2;

              // Convert tile back to world position with new zoom
              const worldPosition = {
                  x: halfW * tileBeforeZoom.x - halfW * tileBeforeZoom.y,
                  y: -(halfH * tileBeforeZoom.x + halfH * tileBeforeZoom.y)
              };

              // Convert world position to screen position with current scroll
              const screenAfterZoom = {
                  x: worldPosition.x + rendererSize.width * 0.5 + state.scroll.position.x,
                  y: worldPosition.y + rendererSize.height * 0.5 + state.scroll.position.y
              };

              // Calculate the difference and adjust scroll to compensate
              const screenDelta = {
                  x: screenAfterZoom.x - screenPosition.x,
                  y: screenAfterZoom.y - screenPosition.y
              };

              const newScrollPosition = {
                  x: state.scroll.position.x - screenDelta.x,
                  y: state.scroll.position.y - screenDelta.y
              };

              set({
                  zoom: newZoom,
                  scroll: {
                      ...state.scroll,
                      position: newScrollPosition
                  }
              });
          },
          decrementZoomAtPosition: (screenPosition: { x: number; y: number }, rendererSize: { width: number; height: number }) => {
              const state = get();
              const oldZoom = state.zoom;
              const newZoom = decrementZoom(oldZoom);

              if (oldZoom === newZoom) return; // No zoom change

              // Calculate the tile position at the mouse cursor before zoom
              const tileBeforeZoom = screenToIso({
                  mouse: screenPosition,
                  zoom: oldZoom,
                  scroll: state.scroll,
                  rendererSize
              });

              // Calculate where this tile would appear on screen after zoom with new zoom level
              // We need to reverse the screenToIso calculation with the new zoom
              const projectedTileSize = {
                  width: PROJECTED_TILE_SIZE.width * newZoom,
                  height: PROJECTED_TILE_SIZE.height * newZoom
              };
              const halfW = projectedTileSize.width / 2;
              const halfH = projectedTileSize.height / 2;

              // Convert tile back to world position with new zoom
              const worldPosition = {
                  x: halfW * tileBeforeZoom.x - halfW * tileBeforeZoom.y,
                  y: -(halfH * tileBeforeZoom.x + halfH * tileBeforeZoom.y)
              };

              // Convert world position to screen position with current scroll
              const screenAfterZoom = {
                  x: worldPosition.x + rendererSize.width * 0.5 + state.scroll.position.x,
                  y: worldPosition.y + rendererSize.height * 0.5 + state.scroll.position.y
              };

              // Calculate the difference and adjust scroll to compensate
              const screenDelta = {
                  x: screenAfterZoom.x - screenPosition.x,
                  y: screenAfterZoom.y - screenPosition.y
              };

              const newScrollPosition = {
                  x: state.scroll.position.x - screenDelta.x,
                  y: state.scroll.position.y - screenDelta.y
              };

              set({
                  zoom: newZoom,
                  scroll: {
                      ...state.scroll,
                      position: newScrollPosition
                  }
              });
          },
        setZoom: (zoom) => {
          set({ zoom });
        },
        setScroll: ({ position, offset }) => {
          set({ scroll: { position, offset: offset ?? get().scroll.offset } });
        },
        setItemControls: (itemControls) => {
          set({ itemControls });
        },
        setContextMenu: (contextMenu) => {
          set({ contextMenu });
        },
        setMouse: (mouse) => {
          set({ mouse });
        },
        setEnableDebugTools: (enableDebugTools) => {
          set({ enableDebugTools });
        },
        setRendererEl: (el) => {
          set({ rendererEl: el });
        },
          setHasUnsavedChanges: (hasUnsavedChanges) => {
              set({hasUnsavedChanges});
        }
      }
    };
  });
};

const UiStateContext = createContext<ReturnType<typeof initialState> | null>(
  null
);

interface ProviderProps {
  children: React.ReactNode;
}

// TODO: Typings below are pretty gnarly due to the way Zustand works.
// see https://github.com/pmndrs/zustand/discussions/1180#discussioncomment-3439061
export const UiStateProvider = ({ children }: ProviderProps) => {
  const storeRef = useRef<ReturnType<typeof initialState>>();

  if (!storeRef.current) {
    storeRef.current = initialState();
  }

  return (
    <UiStateContext.Provider value={storeRef.current}>
      {children}
    </UiStateContext.Provider>
  );
};

export function useUiStateStore<T>(selector: (state: UiStateStore) => T) {
  const store = useContext(UiStateContext);

  if (store === null) {
    throw new Error('Missing provider in the tree');
  }

  const value = useStore(store, selector);
  return value;
}
