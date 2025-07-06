import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, GlobalStyles as MUIGlobalStyles } from '@mui/material';
import { theme } from 'src/styles/theme';
import { IsoflamProps } from 'src/types';
import { setWindowCursor, modelFromModelStore, generateId } from 'src/utils';
import { useModelStore, ModelProvider } from 'src/stores/modelStore';
import { SceneProvider } from 'src/stores/sceneStore';
import 'react-quill/dist/quill.snow.css';
import { Renderer } from 'src/components/Renderer/Renderer';
import { UiOverlay } from 'src/components/UiOverlay/UiOverlay';
import { UiStateProvider, useUiStateStore } from 'src/stores/uiStateStore';
import { HistoryProvider, useHistoryStore } from 'src/stores/historyStore';
import { INITIAL_DATA, MAIN_MENU_OPTIONS, TEXTBOX_DEFAULTS } from 'src/config';
import { useInitialDataManager } from 'src/hooks/useInitialDataManager';
import { useScene } from 'src/hooks/useScene';

const App = ({
  initialData,
  mainMenuOptions = MAIN_MENU_OPTIONS,
  width = '100%',
  height = '100%',
  onModelUpdated,
  enableDebugTools = false,
  editorMode = 'EDITABLE',
  renderer
}: IsoflamProps) => {
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const itemControls = useUiStateStore((state) => {
    return state.itemControls;
  });
  const historyActions = useHistoryStore((state) => {
    return state.actions;
  });
  const initialDataManager = useInitialDataManager();
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });
  const scene = useScene();

  const { load } = initialDataManager;

  useEffect(() => {
    load({ ...INITIAL_DATA, ...initialData });
  }, [initialData, load]);

  useEffect(() => {
    uiStateActions.setEditorMode(editorMode);
    uiStateActions.setMainMenuOptions(mainMenuOptions);
  }, [editorMode, uiStateActions, mainMenuOptions]);

  useEffect(() => {
    return () => {
      setWindowCursor('default');
    };
  }, []);

  useEffect(() => {
    if (!initialDataManager.isReady || !onModelUpdated) return;

    onModelUpdated(model);
  }, [model, initialDataManager.isReady, onModelUpdated]);

  useEffect(() => {
    uiStateActions.setEnableDebugTools(enableDebugTools);
  }, [enableDebugTools, uiStateActions]);

  // Keyboard shortcuts handler
  useEffect(() => {
    // Store copied item data
    const copiedItemRef = { current: null };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts in editable mode
      if (editorMode !== 'EDITABLE') return;

      // Prevent shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        // Number keys for tool selection (1-6)
        case '1': {
          event.preventDefault();
          uiStateActions.setMode({
            type: 'CURSOR',
            showCursor: true,
            mousedownItem: null
          });
          break;
        }
        case '2': {
          event.preventDefault();
          uiStateActions.setMode({
            type: 'PAN',
            showCursor: false
          });
          uiStateActions.setItemControls(null);
          break;
        }
        case '3': {
          event.preventDefault();
          uiStateActions.setItemControls({
            type: 'ADD_ITEM'
          });
          uiStateActions.setMode({
            type: 'PLACE_ICON',
            showCursor: true,
            id: null
          });
          break;
        }
        case '4': {
          event.preventDefault();
          uiStateActions.setMode({
            type: 'RECTANGLE.DRAW',
            showCursor: true,
            id: null
          });
          break;
        }
        case '5': {
          event.preventDefault();
          uiStateActions.setMode({
            type: 'CONNECTOR',
            id: null,
            showCursor: true
          });
          break;
        }
        case '6': {
          event.preventDefault();
          const textBoxId = generateId();
          const mousePosition = useUiStateStore.getState().mouse.position.tile;
          scene.createTextBox({
            ...TEXTBOX_DEFAULTS,
            id: textBoxId,
            tile: mousePosition
          });
          uiStateActions.setMode({
            type: 'TEXTBOX',
            showCursor: false,
            id: textBoxId
          });
          break;
        }

        case 'Delete':
        case 'Backspace': {
          event.preventDefault();
          if (itemControls) {
            // Delete the currently selected item
            switch (itemControls.type) {
              case 'ITEM':
                scene.deleteViewItem(itemControls.id);
                break;
              case 'CONNECTOR':
                scene.deleteConnector(itemControls.id);
                break;
              case 'TEXTBOX':
                scene.deleteTextBox(itemControls.id);
                break;
              case 'RECTANGLE':
                scene.deleteRectangle(itemControls.id);
                break;
              default:
                // Unknown item type, do nothing
                break;
            }
            uiStateActions.setItemControls(null);
          }
          break;
        }

        case 'z':
        case 'Z': {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Perform undo action
            const action = historyActions.undo();
            if (action) {
              console.log('Undo action performed:', action);
              // Apply the action using the applyAction function from useScene
              scene.applyAction(action);
            } else {
              console.log('Nothing to undo');
            }
          }
          break;
        }

        case 'y':
        case 'Y': {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Perform redo action
            const action = historyActions.redo();
            if (action) {
              console.log('Redo action performed:', action);
              // Apply the action using the applyAction function from useScene
              scene.applyAction(action);
            } else {
              console.log('Nothing to redo');
            }
          }
          break;
        }

        case 'c':
        case 'C': {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Copy the currently selected item
            if (itemControls) {
              switch (itemControls.type) {
                case 'ITEM': {
                  const viewItem = scene.items.find((item) => {
                    return item.id === itemControls.id;
                  });
                  if (viewItem) {
                    copiedItemRef.current = {
                      type: 'ITEM',
                      data: { ...viewItem }
                    };
                    console.log('Copied view item');
                  }
                  break;
                }
                case 'CONNECTOR': {
                  const connector = scene.connectors.find((conn) => {
                    return conn.id === itemControls.id;
                  });
                  if (connector) {
                    copiedItemRef.current = {
                      type: 'CONNECTOR',
                      data: { ...connector }
                    };
                    console.log('Copied connector');
                  }
                  break;
                }
                case 'TEXTBOX': {
                  const textBox = scene.textBoxes.find((tb) => {
                    return tb.id === itemControls.id;
                  });
                  if (textBox) {
                    copiedItemRef.current = {
                      type: 'TEXTBOX',
                      data: { ...textBox }
                    };
                    console.log('Copied text box');
                  }
                  break;
                }
                case 'RECTANGLE': {
                  const rectangle = scene.rectangles.find((rect) => {
                    return rect.id === itemControls.id;
                  });
                  if (rectangle) {
                    copiedItemRef.current = {
                      type: 'RECTANGLE',
                      data: { ...rectangle }
                    };
                    console.log('Copied rectangle');
                  }
                  break;
                }
                default:
                  // Unknown item type, do nothing
                  break;
              }
            }
          }
          break;
        }

        case 'v':
        case 'V': {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Paste the copied item
            if (copiedItemRef.current) {
              const { type, data } = copiedItemRef.current;
              const newId = generateId();
              // Apply a small offset to make the pasted item visible
              const offset = { x: 1, y: 0 };
              switch (type) {
                case 'ITEM': {
                  scene.createViewItem({
                    ...data,
                    id: newId,
                    tile: {
                      x: data.tile.x + offset.x,
                      y: data.tile.y + offset.y
                    }
                  });
                  console.log('Pasted view item');
                  break;
                }
                case 'CONNECTOR': {
                  scene.createConnector({
                    ...data,
                    id: newId,
                    // For connectors, we need to adjust both from and to points
                    from: {
                      x: data.from.x + offset.x,
                      y: data.from.y + offset.y
                    },
                    to: {
                      x: data.to.x + offset.x,
                      y: data.to.y + offset.y
                    }
                  });
                  console.log('Pasted connector');
                  break;
                }
                case 'TEXTBOX': {
                  scene.createTextBox({
                    ...data,
                    id: newId,
                    tile: {
                      x: data.tile.x + offset.x,
                      y: data.tile.y + offset.y
                    }
                  });
                  console.log('Pasted text box');
                  break;
                }
                case 'RECTANGLE': {
                  scene.createRectangle({
                    ...data,
                    id: newId,
                    from: {
                      x: data.from.x + offset.x,
                      y: data.from.y + offset.y
                    },
                    to: {
                      x: data.to.x + offset.x,
                      y: data.to.y + offset.y
                    }
                  });
                  console.log('Pasted rectangle');
                  break;
                }
                default:
                  // Unknown item type, do nothing
                  break;
              }
            }
          }
          break;
        }

        default:
          // Other keys, do nothing
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorMode, itemControls, scene, uiStateActions]);

  if (!initialDataManager.isReady) return null;

  return (
    <>
      <MUIGlobalStyles
        styles={{
          div: {
            boxSizing: 'border-box'
          }
        }}
      />
      <Box
        sx={{
          width,
          height,
          position: 'relative',
          overflow: 'hidden',
          transform: 'translateZ(0)'
        }}
      >
        <Renderer {...renderer} />
        <UiOverlay />
      </Box>
    </>
  );
};

export const Isoflam = (props: IsoflamProps) => {
  return (
    <ThemeProvider theme={theme}>
      <ModelProvider>
        <SceneProvider>
          <UiStateProvider>
            <HistoryProvider>
              <App {...props} />
            </HistoryProvider>
          </UiStateProvider>
        </SceneProvider>
      </ModelProvider>
    </ThemeProvider>
  );
};

const useIsoflam = () => {
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });

  const ModelActions = useModelStore((state) => {
    return state.actions;
  });

  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });

  return {
    Model: ModelActions,
    uiState: uiStateActions,
    rendererEl
  };
};

export { useIsoflam };
export * from 'src/standaloneExports';
export default Isoflam;
