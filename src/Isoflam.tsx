import React, {useEffect} from 'react';
import {ThemeProvider} from '@mui/material/styles';
import {Box, GlobalStyles as MUIGlobalStyles} from '@mui/material';
import {theme} from 'src/styles/theme';
import {IsoflamProps} from 'src/types';
import {modelFromModelStore, setWindowCursor} from 'src/utils';
import {ModelProvider, useModelStore} from 'src/stores/modelStore';
import {SceneProvider} from 'src/stores/sceneStore';
import 'react-quill/dist/quill.snow.css';
import {Renderer} from 'src/components/Renderer/Renderer';
import {UiOverlay} from 'src/components/UiOverlay/UiOverlay';
import {UiStateProvider, useUiStateStore} from 'src/stores/uiStateStore';
import {INITIAL_DATA, MAIN_MENU_OPTIONS} from 'src/config';
import {useInitialDataManager} from 'src/hooks/useInitialDataManager';
import {useScene} from 'src/hooks/useScene';
import {useTranslation} from 'src/hooks/useTranslation';

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
    const hasUnsavedChanges = useUiStateStore((state) => {
        return state.hasUnsavedChanges;
    });
  const initialDataManager = useInitialDataManager();
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });
  const scene = useScene();
    const {t} = useTranslation();

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

    // Handle beforeunload event to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                const message = t('Your unsaved changes will be lost');
                event.preventDefault();
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges, t]);

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

        case 'z':
        case 'Z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // TODO: Implement undo functionality
          }
          break;

        case 'y':
        case 'Y':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // TODO: Implement redo functionality
          }
          break;

        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) {
            // Allow default copy behavior (do not call event.preventDefault())
          }
          break;

        case 'v':
        case 'V':
          if (event.ctrlKey || event.metaKey) {
            // Allow default paste behavior (do not call event.preventDefault())
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
