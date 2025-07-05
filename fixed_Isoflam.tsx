import React, { useEffect, useRef } from 'react';
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
import { INITIAL_DATA, MAIN_MENU_OPTIONS } from 'src/config';
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
  const mouse = useUiStateStore((state) => {
    return state.mouse;
  });
  const initialDataManager = useInitialDataManager();
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });
  const scene = useScene();

  // Reference to store copied item for copy/paste functionality
  const copiedItemRef = useRef<any>(null);

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
        case 'Delete':
        case 'Backspace':
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

        // Number shortcuts for tools
        case '1': {
          // Select tool
          event.preventDefault();
          uiStateActions.setMode({
            type: 'CURSOR',
            showCursor: true,
            mousedownItem: null
          });
          break;
        }
        case '2': {
          // Pan tool
          event.preventDefault();
          uiStateActions.setMode({
            type: 'PAN',
            showCursor: false
          });
          uiStateActions.setItemControls(null);
          break;
        }
        case '3': {
          // Add item tool
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
          // Rectangle tool
          event.preventDefault();
          uiStateActions.setMode({
            type: 'RECTANGLE.DRAW',
            showCursor: true,
            id: null
          });
          break;
        }
        case '5': {
          // Connector tool
          event.preventDefault();
          uiStateActions.setMode({
            type: 'CONNECTOR',
            id: null,
            showCursor: true
          });
          break;
        }
        case '6': {
          // Text tool
          event.preventDefault();
          const textBoxId = generateId();
          scene.createTextBox({
            id: textBoxId,
            tile: mouse.position.tile,
            text: '',
            fontSize: 14,
            color: '#000000'
          });
          uiStateActions.setMode({
            type: 'TEXTBOX',
            showCursor: false,
            id: textBoxId
          });
          break;
        }

        case 'z':
        case 'Z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Implement undo functionality
            console.log('Undo action triggered');
            // This would typically call a history manager's undo method
            // For now, we'll just log that the action was triggered
          }
          break;

        case 'y':
        case 'Y':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Implement redo functionality
            console.log('Redo action triggered');
            // This would typically call a history manager's redo method
            // For now, we'll just log that the action was triggered
          }
          break;

        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Copy the currently selected item
            if (itemControls) {
              console.log('Copy action triggered for', itemControls.type);
              copiedItemRef.current = {
                type: itemControls.type,
                id: itemControls.id
              };
            }
          }
          break;

        case 'v':
        case 'V':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Paste the copied item
            if (copiedItemRef.current) {
              console.log(
                'Paste action triggered for',
                copiedItemRef.current.type
              );
              const { type, id } = copiedItemRef.current;
              switch (type) {
                case 'RECTANGLE': {
                  const originalRectangle = scene.getRectangle(id);
                  if (originalRectangle) {
                    const newRectangle = {
                      ...originalRectangle,
                      id: generateId(),
                      from: {
                        x: originalRectangle.from.x + 1,
                        y: originalRectangle.from.y
                      },
                      to: {
                        x: originalRectangle.to.x + 1,
                        y: originalRectangle.to.y
                      }
                    };
                    scene.createRectangle(newRectangle);
                  }
                  break;
                }
                case 'TEXTBOX': {
                  const originalTextBox = scene.getTextBox(id);
                  if (originalTextBox) {
                    const newTextBox = {
                      ...originalTextBox,
                      id: generateId(),
                      tile: {
                        x: originalTextBox.tile.x + 1,
                        y: originalTextBox.tile.y
                      }
                    };
                    scene.createTextBox(newTextBox);
                  }
                  break;
                }
                case 'ITEM': {
                  const originalItem = scene.getViewItem(id);
                  if (originalItem) {
                    const newItem = {
                      ...originalItem,
                      id: generateId(),
                      tile: {
                        x: originalItem.tile.x + 1,
                        y: originalItem.tile.y
                      }
                    };
                    scene.createViewItem(newItem);
                  }
                  break;
                }
                case 'CONNECTOR': {
                  const originalConnector = scene.getConnector(id);
                  if (originalConnector) {
                    const newConnector = {
                      ...originalConnector,
                      id: generateId(),
                      from: {
                        x: originalConnector.from.x + 1,
                        y: originalConnector.from.y
                      },
                      to: {
                        x: originalConnector.to.x + 1,
                        y: originalConnector.to.y
                      }
                    };
                    scene.createConnector(newConnector);
                  }
                  break;
                }
                default:
                  break;
              }
            }
          }
          break;

        default:
          // Other keys, do nothing
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorMode, itemControls, scene, uiStateActions, mouse]);

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
            <App {...props} />
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