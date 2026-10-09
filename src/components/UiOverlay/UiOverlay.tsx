import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { EditorModeEnum } from 'src/types';
import { UiElement } from 'components/UiElement/UiElement';
import { SceneLayer } from 'src/components/SceneLayer/SceneLayer';
import { DragAndDrop } from 'src/components/DragAndDrop/DragAndDrop';
import { ItemControlsManager } from 'src/components/ItemControls/ItemControlsManager';
import { ToolMenu } from 'src/components/ToolMenu/ToolMenu';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { MainMenu } from 'src/components/MainMenu/MainMenu';
import { ZoomControls } from 'src/components/ZoomControls/ZoomControls';
import { DebugUtils } from 'src/components/DebugUtils/DebugUtils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { ContextMenuManager } from 'src/components/ContextMenu/ContextMenuManager';
import { useModelFileLoader } from 'src/hooks/useModelFileLoader';
import { useTranslation } from 'src/hooks/useTranslation';
import { useImageHandler } from 'src/hooks/useImageHandler';
import { screenToIso } from 'src/utils/renderer';
import horusLogo from 'src/assets/horus.png';
import { ExportImageDialog } from '../ExportImageDialog/ExportImageDialog';
import { CreditsDialog } from '../CreditsDialog/CreditsDialog';
import { UndoRedoControls } from '../UndoRedoControls/UndoRedoControls';
import { ReadOnlyToggle } from '../ReadOnlyToggle/ReadOnlyToggle';

const ToolsEnum = {
  MAIN_MENU: 'MAIN_MENU',
  ZOOM_CONTROLS: 'ZOOM_CONTROLS',
  TOOL_MENU: 'TOOL_MENU',
  ITEM_CONTROLS: 'ITEM_CONTROLS',
  VIEW_TITLE: 'VIEW_TITLE',
  FOOTER_CREDITS: 'FOOTER_CREDITS',
  UNDO_REDO_CONTROLS: 'UNDO_REDO_CONTROLS',
  READ_ONLY_TOGGLE: 'READ_ONLY_TOGGLE'
} as const;

interface EditorModeMapping {
  [k: string]: (keyof typeof ToolsEnum)[];
}

const EDITOR_MODE_MAPPING: EditorModeMapping = {
  [EditorModeEnum.EDITABLE]: [
    'ITEM_CONTROLS',
    'ZOOM_CONTROLS',
    'TOOL_MENU',
    'MAIN_MENU',
    'VIEW_TITLE',
    'FOOTER_CREDITS',
    'UNDO_REDO_CONTROLS',
    'READ_ONLY_TOGGLE'
  ],
  [EditorModeEnum.EXPLORABLE_READONLY]: [
    'ZOOM_CONTROLS',
    'VIEW_TITLE',
    'FOOTER_CREDITS',
    'READ_ONLY_TOGGLE'
  ],
  [EditorModeEnum.NON_INTERACTIVE]: []
};

const getEditorModeMapping = (editorMode: keyof typeof EditorModeEnum) => {
  const availableUiFeatures = EDITOR_MODE_MAPPING[editorMode];

  return availableUiFeatures;
};

export const UiOverlay = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { appPadding } = theme.customVars;
  const spacing = useCallback(
    (multiplier: number) => {
      return parseInt(theme.spacing(multiplier), 10);
    },
    [theme]
  );
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const enableDebugTools = useUiStateStore((state) => {
    return state.enableDebugTools;
  });
  const mode = useUiStateStore((state) => {
    return state.mode;
  });
  const dialog = useUiStateStore((state) => {
    return state.dialog;
  });
  const itemControls = useUiStateStore((state) => {
    return state.itemControls;
  });
  const editorMode = useUiStateStore((state) => {
    return state.editorMode;
  });
  const availableTools = useMemo(() => {
    return getEditorModeMapping(editorMode);
  }, [editorMode]);
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });
  const { size: rendererSize } = useResizeObserver(rendererEl);
  const scroll = useUiStateStore((state) => {
    return state.scroll;
  });
  const zoom = useUiStateStore((state) => {
    return state.zoom;
  });

  // Drag & Drop functionality
  const { confirmDiscardChanges, loadModelFile } = useModelFileLoader();
  const { handleImageFile: handleImageFileShared } = useImageHandler();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle JSON file loading (existing functionality)
  const handleJsonFile = useCallback(
    (file: File) => {
      if (!confirmDiscardChanges()) return;

      loadModelFile(file, {
        onLoadingStart: () => {
          return setIsLoading(true);
        },
        onLoadingEnd: () => {
          return setIsLoading(false);
        }
      });
    },
    [confirmDiscardChanges, loadModelFile]
  );

  // Handle image file loading (new functionality)
  const handleImageFile = useCallback(
    (file: File) => {
      // Calculate viewport center position in tile coordinates
      const viewportCenter = screenToIso({
        mouse: {
          x: rendererSize.width / 2,
          y: rendererSize.height / 2
        },
        zoom,
        scroll,
        rendererSize
      });

      handleImageFileShared(
        file,
        {
          position: {
            x: Math.round(viewportCenter.x),
            y: Math.round(viewportCenter.y)
          },
          style: 'SOLID',
          size: { width: 5, height: 5 }
        },
        {
          onLoadingStart: () => {
            return setIsLoading(true);
          },
          onLoadingEnd: () => {
            return setIsLoading(false);
          },
          onError: () => {
            return setIsLoading(false);
          }
        }
      );
    },
    [handleImageFileShared, rendererSize, zoom, scroll]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide drag overlay if leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      // Dropping a drawing or an image changes the model: only allowed in edit mode
      if (editorMode !== 'EDITABLE') return;

      const files = Array.from(e.dataTransfer.files);
      const jsonFiles = files.filter((file) => {
        return (
          file.type === 'application/json' ||
          file.name.toLowerCase().endsWith('.json')
        );
      });
      const imageFiles = files.filter((file) => {
        return (
          file.type.startsWith('image/') ||
          /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
        );
      });

      // Handle JSON files (existing functionality)
      if (jsonFiles.length > 0) {
        if (jsonFiles.length > 1) {
          alert(t('Please drop a single JSON file at a time.'));
          return;
        }
        handleJsonFile(jsonFiles[0]);
        return;
      }

      // Handle image files (new functionality)
      if (imageFiles.length > 0) {
        if (imageFiles.length > 1) {
          alert(t('Please drop a single image at a time.'));
          return;
        }
        handleImageFile(imageFiles[0]);
        return;
      }

      // No supported files found
      alert(t('Please drop a JSON file or a valid image.'));
    },
    [editorMode, handleJsonFile, handleImageFile, t]
  );

  // Global drag event listeners
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      // Check if dragged items contain files
      if (
        e.dataTransfer?.types.includes('Files') &&
        editorMode === 'EDITABLE'
      ) {
        setIsDragOver(true);
      }
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only hide if leaving the window entirely
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragOver(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    // Add global event listeners
    window.addEventListener('dragenter', handleGlobalDragEnter);
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragleave', handleGlobalDragLeave);
    window.addEventListener('drop', handleGlobalDrop);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('dragenter', handleGlobalDragEnter);
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragleave', handleGlobalDragLeave);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, [editorMode]);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          width: 0,
          height: 0,
          top: 0,
          left: 0
        }}
      >
        {availableTools.includes('ITEM_CONTROLS') && itemControls && (
          <UiElement
            sx={{
              position: 'absolute',
              width: '360px',
              overflowY: 'scroll',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
            style={{
              left: appPadding.x,
              top: appPadding.y * 2 + spacing(2),
              maxHeight: rendererSize.height - appPadding.y * 6
            }}
          >
            <ItemControlsManager />
          </UiElement>
        )}

        {availableTools.includes('TOOL_MENU') && (
          <Box
            sx={{
              position: 'absolute',
              transform: 'translateX(-100%)'
            }}
            style={{
              left: rendererSize.width - appPadding.x,
              top: appPadding.y
            }}
          >
            <ToolMenu />
          </Box>
        )}

        {availableTools.includes('ZOOM_CONTROLS') && (
          <Box
            sx={{
              position: 'absolute',
              transformOrigin: 'bottom left'
            }}
            style={{
              top: rendererSize.height - appPadding.y * 2,
              left: appPadding.x
            }}
          >
            <ZoomControls />
          </Box>
        )}

        {availableTools.includes('READ_ONLY_TOGGLE') && (
          <Box
            sx={{
              position: 'absolute',
              transformOrigin: 'bottom left'
            }}
            style={{
              top: rendererSize.height - appPadding.y * 2,
              left: appPadding.x + 200 // Position to the right of ZoomControls
            }}
          >
            <ReadOnlyToggle />
          </Box>
        )}

        {availableTools.includes('MAIN_MENU') && (
          <Box
            sx={{
              position: 'absolute'
            }}
            style={{
              top: appPadding.y,
              left: appPadding.x
            }}
          >
            <MainMenu />
          </Box>
        )}

        {availableTools.includes('UNDO_REDO_CONTROLS') && (
          <Box
            sx={{
              position: 'absolute'
            }}
            style={{
              top: appPadding.y,
              left: appPadding.x + 60 // Position to the right of MainMenu
            }}
          >
            <UndoRedoControls />
          </Box>
        )}

        {/* {availableTools.includes('VIEW_TITLE') && ( */}
        {/*  <Box */}
        {/*    sx={{ */}
        {/*      position: 'absolute', */}
        {/*      display: 'flex', */}
        {/*      justifyContent: 'center', */}
        {/*      transform: 'translateX(-50%)', */}
        {/*      pointerEvents: 'none' */}
        {/*    }} */}
        {/*    style={{ */}
        {/*      left: rendererSize.width / 2, */}
        {/*      top: rendererSize.height - appPadding.y * 2, */}
        {/*      width: rendererSize.width - 500, */}
        {/*      height: appPadding.y */}
        {/*    }} */}
        {/*  > */}
        {/*    <UiElement */}
        {/*      sx={{ */}
        {/*        display: 'inline-flex', */}
        {/*        px: 2, */}
        {/*        alignItems: 'center', */}
        {/*        height: '100%' */}
        {/*      }} */}
        {/*    > */}
        {/*      <Stack direction="row" alignItems="center"> */}
        {/*        <Typography fontWeight={600} color="text.secondary"> */}
        {/*          {title} */}
        {/*        </Typography> */}
        {/*        <ChevronRight /> */}
        {/*        <Typography fontWeight={600} color="text.secondary"> */}
        {/*          {currentView.name} */}
        {/*        </Typography> */}
        {/*      </Stack> */}
        {/*    </UiElement> */}
        {/*  </Box> */}
        {/* )} */}

        {enableDebugTools && (
          <UiElement
            sx={{
              position: 'absolute',
              width: 350,
              transform: 'translateY(-100%)'
            }}
            style={{
              maxWidth: `calc(${rendererSize.width} - ${appPadding.x * 2}px)`,
              left: appPadding.x,
              top: rendererSize.height - appPadding.y * 2 - spacing(1)
            }}
          >
            <DebugUtils />
          </UiElement>
        )}

        {/* Footer credit */}
        {availableTools.includes('FOOTER_CREDITS') && (
          <Box
            sx={{
              position: 'absolute',
              transform: 'translateX(-100%)'
            }}
            style={{
              left: rendererSize.width - appPadding.x,
              top: rendererSize.height - appPadding.y * 2,
              width: 250
            }}
          >
            <UiElement
              sx={{
                px: 2,
                py: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  '& a': {
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }
                }}
              >
                <a
                  href="https://gohorus.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {t('Developed with ❤️ by')} <b>HORUS</b>
                  <img
                    src={horusLogo}
                    alt="HORUS logo"
                    style={{
                      height: '16px',
                      width: 'auto',
                      marginLeft: '4px'
                    }}
                  />
                </a>
              </Typography>
            </UiElement>
          </Box>
        )}
      </Box>

      {mode.type === 'PLACE_ICON' && mode.id && (
        <SceneLayer disableAnimation>
          <DragAndDrop iconId={mode.id} />
        </SceneLayer>
      )}

      {dialog === 'EXPORT_IMAGE' && (
        <ExportImageDialog
          onClose={() => {
            return uiStateActions.setDialog(null);
          }}
        />
      )}

      {dialog === 'CREDITS' && (
        <CreditsDialog
          onClose={() => {
            return uiStateActions.setDialog(null);
          }}
        />
      )}

      {/* The menu is positioned at the click position (MUI portal) */}
      <ContextMenuManager />

      {/* Drag & Drop Overlay */}
      {(isDragOver || isLoading) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: isDragOver ? 'all' : 'none'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'primary.main',
              minWidth: 300
            }}
          >
            {isLoading ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {t('Loading...')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Please wait while the file is loading.')}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  {t('Drop a JSON file or an image here')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Release to open the drawing or add the image to it.')}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};
