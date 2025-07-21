import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Box, Typography, useTheme} from '@mui/material';
import {EditorModeEnum} from 'src/types';
import {UiElement} from 'components/UiElement/UiElement';
import {SceneLayer} from 'src/components/SceneLayer/SceneLayer';
import {DragAndDrop} from 'src/components/DragAndDrop/DragAndDrop';
import {ItemControlsManager} from 'src/components/ItemControls/ItemControlsManager';
import {ToolMenu} from 'src/components/ToolMenu/ToolMenu';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {MainMenu} from 'src/components/MainMenu/MainMenu';
import {ZoomControls} from 'src/components/ZoomControls/ZoomControls';
import {DebugUtils} from 'src/components/DebugUtils/DebugUtils';
import {useResizeObserver} from 'src/hooks/useResizeObserver';
import {ContextMenuManager} from 'src/components/ContextMenu/ContextMenuManager';
import {useScene} from 'src/hooks/useScene';
import {useModelStore} from 'src/stores/modelStore';
import {useInitialDataManager} from 'src/hooks/useInitialDataManager';
import {ExportImageDialog} from '../ExportImageDialog/ExportImageDialog';
import {CreditsDialog} from '../CreditsDialog/CreditsDialog';
import horusLogo from 'src/assets/horus.png';

const ToolsEnum = {
  MAIN_MENU: 'MAIN_MENU',
  ZOOM_CONTROLS: 'ZOOM_CONTROLS',
  TOOL_MENU: 'TOOL_MENU',
  ITEM_CONTROLS: 'ITEM_CONTROLS',
  VIEW_TITLE: 'VIEW_TITLE',
  FOOTER_CREDITS: 'FOOTER_CREDITS'
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
    'FOOTER_CREDITS'
  ],
  [EditorModeEnum.EXPLORABLE_READONLY]: ['ZOOM_CONTROLS', 'VIEW_TITLE', 'FOOTER_CREDITS'],
  [EditorModeEnum.NON_INTERACTIVE]: []
};

const getEditorModeMapping = (editorMode: keyof typeof EditorModeEnum) => {
  const availableUiFeatures = EDITOR_MODE_MAPPING[editorMode];

  return availableUiFeatures;
};

export const UiOverlay = () => {
  const theme = useTheme();
  const contextMenuAnchorRef = useRef();
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
  const mouse = useUiStateStore((state) => {
    return state.mouse;
  });
  const dialog = useUiStateStore((state) => {
    return state.dialog;
  });
  const itemControls = useUiStateStore((state) => {
    return state.itemControls;
  });
  const { currentView } = useScene();
  const editorMode = useUiStateStore((state) => {
    return state.editorMode;
  });
  const availableTools = useMemo(() => {
    return getEditorModeMapping(editorMode);
  }, [editorMode]);
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });
  const title = useModelStore((state) => {
    return state.title;
  });
  const { size: rendererSize } = useResizeObserver(rendererEl);

    // Drag & Drop functionality
    const initialDataManager = useInitialDataManager();
    const scene = useScene();
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle JSON file loading (existing functionality)
    const handleJsonFile = useCallback((file: File) => {
        setIsLoading(true);

        // Check file size (warn if larger than 5MB)
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            const proceed = confirm(
                `Le fichier JSON est volumineux (${fileSizeMB} MB). Le chargement pourrait prendre du temps et affecter les performances. Voulez-vous continuer ?`
            );
            if (!proceed) {
                setIsLoading(false);
                return;
            }
        }

        try {
            const fileReader = new FileReader();

            fileReader.onload = async (event) => {
                try {
                    const jsonString = event.target?.result as string;

                    // Check if the JSON string is extremely large
                    if (jsonString.length > 1000000) { // 1MB of text
                        console.warn('Large JSON file detected, this may cause performance issues');
                    }

                    const modelData = JSON.parse(jsonString);

                    // Validate that it's a proper model structure
                    if (!modelData || typeof modelData !== 'object') {
                        throw new Error('Le fichier JSON ne contient pas de données valides');
                    }

                    if (!modelData.title && !modelData.views && !modelData.items) {
                        throw new Error('Le fichier JSON ne semble pas être un fichier Isoflam valide');
                    }

                    initialDataManager.load(modelData);
                    uiStateActions.resetUiState();

                    // Success message for large files
                    if (file.size > maxFileSize / 2) {
                        console.log('Large JSON file loaded successfully');
                    }

                } catch (error) {
                    console.error('Error parsing JSON:', error);

                    // Provide more specific error messages
                    let errorMessage = 'Erreur lors du chargement du fichier JSON.';

                    if (error instanceof SyntaxError) {
                        errorMessage += ' Le fichier contient du JSON invalide. Vérifiez la syntaxe du fichier.';
                    } else if (error instanceof Error) {
                        errorMessage += ` ${error.message}`;
                    } else {
                        errorMessage += ' Veuillez vérifier que le fichier est valide.';
                    }

                    alert(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            };

            fileReader.onerror = () => {
                alert('Erreur lors de la lecture du fichier. Le fichier pourrait être corrompu.');
                setIsLoading(false);
            };

            fileReader.readAsText(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Erreur lors de la lecture du fichier. Vérifiez que le fichier est accessible.');
            setIsLoading(false);
        }
    }, [initialDataManager, uiStateActions]);

    // Handle image file loading (new functionality)
    const handleImageFile = useCallback((file: File) => {
        setIsLoading(true);

        try {
            const fileReader = new FileReader();

            fileReader.onload = async (event) => {
                try {
                    const imageData = event.target?.result as string;

                    // Create a new image rectangle at the center of the view
                    const newRectangle = {
                        id: `image-rect-${Date.now()}`,
                        from: {x: 5, y: 5},
                        to: {x: 10, y: 10},
                        imageData,
                        imageName: file.name,
                        style: 'SOLID' as const,
                        width: 2,
                        radius: 0
                    };

                    scene.createRectangle(newRectangle);

                    // Switch to rectangle transform mode to allow immediate editing
                    uiStateActions.setMode({
                        type: 'RECTANGLE.TRANSFORM',
                        id: newRectangle.id,
                        showCursor: false,
                        selectedAnchor: null
                    });

                    uiStateActions.setItemControls({
                        type: 'RECTANGLE',
                        id: newRectangle.id
                    });

                } catch (error) {
                    console.error('Error processing image:', error);
                    alert('Erreur lors du traitement de l\'image.');
                } finally {
                    setIsLoading(false);
                }
            };

            fileReader.onerror = () => {
                alert('Erreur lors de la lecture du fichier image.');
                setIsLoading(false);
            };

            fileReader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading image file:', error);
            alert('Erreur lors de la lecture du fichier image.');
            setIsLoading(false);
        }
    }, [scene, uiStateActions]);

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

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const jsonFiles = files.filter(file =>
            file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')
        );
        const imageFiles = files.filter(file =>
            file.type.startsWith('image/') ||
            /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
        );

        // Handle JSON files (existing functionality)
        if (jsonFiles.length > 0) {
            if (jsonFiles.length > 1) {
                alert('Veuillez déposer un seul fichier JSON à la fois.');
                return;
            }
            handleJsonFile(jsonFiles[0]);
            return;
        }

        // Handle image files (new functionality)
        if (imageFiles.length > 0) {
            if (imageFiles.length > 1) {
                alert('Veuillez déposer une seule image à la fois.');
                return;
            }
            handleImageFile(imageFiles[0]);
            return;
        }

        // No supported files found
        alert('Veuillez déposer un fichier JSON ou une image valide.');
    }, [initialDataManager, uiStateActions]);

    // Global drag event listeners
    useEffect(() => {
        const handleGlobalDragEnter = (e: DragEvent) => {
            e.preventDefault();
            // Check if dragged items contain files
            if (e.dataTransfer?.types.includes('Files')) {
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
    }, []);

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

        {/*{availableTools.includes('VIEW_TITLE') && (*/}
        {/*  <Box*/}
        {/*    sx={{*/}
        {/*      position: 'absolute',*/}
        {/*      display: 'flex',*/}
        {/*      justifyContent: 'center',*/}
        {/*      transform: 'translateX(-50%)',*/}
        {/*      pointerEvents: 'none'*/}
        {/*    }}*/}
        {/*    style={{*/}
        {/*      left: rendererSize.width / 2,*/}
        {/*      top: rendererSize.height - appPadding.y * 2,*/}
        {/*      width: rendererSize.width - 500,*/}
        {/*      height: appPadding.y*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <UiElement*/}
        {/*      sx={{*/}
        {/*        display: 'inline-flex',*/}
        {/*        px: 2,*/}
        {/*        alignItems: 'center',*/}
        {/*        height: '100%'*/}
        {/*      }}*/}
        {/*    >*/}
        {/*      <Stack direction="row" alignItems="center">*/}
        {/*        <Typography fontWeight={600} color="text.secondary">*/}
        {/*          {title}*/}
        {/*        </Typography>*/}
        {/*        <ChevronRight />*/}
        {/*        <Typography fontWeight={600} color="text.secondary">*/}
        {/*          {currentView.name}*/}
        {/*        </Typography>*/}
        {/*      </Stack>*/}
        {/*    </UiElement>*/}
        {/*  </Box>*/}
        {/*)}*/}

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
                  Développé avec ❤️ par <b>HORUS</b>
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
          <DragAndDrop iconId={mode.id} tile={mouse.position.tile} />
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

      <SceneLayer>
        <Box ref={contextMenuAnchorRef} />
        <ContextMenuManager anchorEl={contextMenuAnchorRef.current} />
      </SceneLayer>

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
                                Chargement en cours...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Veuillez patienter pendant le chargement du fichier JSON.
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Déposer le fichier JSON ici
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Relâchez pour charger le modèle dans l'application.
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>
        )}
    </>
  );
};
