import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  Stack,
  Alert,
  Checkbox,
  FormControlLabel,
  Typography
} from '@mui/material';
import { useModelStore } from 'src/stores/modelStore';
import {
  exportAsImage,
  downloadFile as downloadFileUtil,
  base64ToBlob,
  generateGenericFilename,
  modelFromModelStore
} from 'src/utils';
import { ModelStore } from 'src/types';
import { useDiagramUtils } from 'src/hooks/useDiagramUtils';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { Isoflam } from 'src/Isoflam';
import { Loader } from 'src/components/Loader/Loader';
import { customVars } from 'src/styles/theme';
import { ColorPicker } from 'src/components/ColorSelector/ColorPicker';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  quality?: number;
  onClose: () => void;
}

export const ExportImageDialog = ({ onClose, quality = 1 }: Props) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>();
  const debounceRef = useRef<NodeJS.Timeout>();
  const currentView = useUiStateStore((state) => {
    return state.view;
  });
  const currentZoom = useUiStateStore((state) => {
    return state.zoom;
  });
  const [imageData, setImageData] = React.useState<string>();
  const [exportError, setExportError] = useState(false);
  const { getUnprojectedBounds } = useDiagramUtils();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const model = useModelStore((state): Omit<ModelStore, 'actions'> => {
    return modelFromModelStore(state);
  });

  const unprojectedBounds = useMemo(() => {
    return getUnprojectedBounds();
  }, [getUnprojectedBounds]);

  useEffect(() => {
    uiStateActions.setMode({
      type: 'INTERACTIONS_DISABLED',
      showCursor: false
    });
  }, [uiStateActions]);

  const exportImage = useCallback(async () => {
    if (!containerRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      exportAsImage(containerRef.current as HTMLDivElement)
        .then((data) => {
          return setImageData(data);
        })
        .catch(() => {
          setExportError(true);
        });
    }, 2000);
  }, []);

  const downloadFile = useCallback(() => {
    if (!imageData) return;

    const data = base64ToBlob(
      imageData.replace('data:image/png;base64,', ''),
      'image/png;charset=utf-8'
    );

    downloadFileUtil(data, generateGenericFilename('png'));
  }, [imageData]);

  const [showGrid, setShowGrid] = useState(false);
  const handleShowGridChange = (checked: boolean) => {
    setShowGrid(checked);
  };

  const [useCurrentView, setUseCurrentView] = useState(true);
  const handleUseCurrentViewChange = (checked: boolean) => {
    setUseCurrentView(checked);
  };

  const [backgroundColor, setBackgroundColor] = useState<string>(
    customVars.customPalette.diagramBg
  );
  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  useEffect(() => {
    setImageData(undefined);
  }, [showGrid, backgroundColor, useCurrentView]);

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{t('Export as image')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            <strong>
              {t('Certain browsers may not support exporting images properly.')}
            </strong>{' '}
            <br />
            {t(
              'For best results, please use the latest version of either Chrome or Firefox.'
            )}
          </Alert>

          {!imageData && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  overflow: 'hidden'
                }}
              >
                <Box
                  ref={containerRef}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  style={{
                    width: unprojectedBounds.width * quality,
                    height: unprojectedBounds.height * quality
                  }}
                >
                  <Isoflam
                    editorMode="NON_INTERACTIVE"
                    onModelUpdated={exportImage}
                    initialData={{
                      ...model,
                      fitToView: !useCurrentView,
                      view: currentView,
                      zoom: useCurrentView ? currentZoom : undefined
                    }}
                    renderer={{
                      showGrid,
                      backgroundColor
                    }}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  top: 0,
                  left: 0,
                  width: 500,
                  height: 300,
                  bgcolor: 'common.white'
                }}
              >
                <Loader size={2} />
              </Box>
            </>
          )}
          <Stack alignItems="center" spacing={2}>
            {imageData && (
              <Box
                component="img"
                sx={{
                  maxWidth: '100%'
                }}
                style={{
                  width: unprojectedBounds.width
                }}
                src={imageData}
                alt={t('preview')}
              />
            )}
            <Box sx={{ width: '100%' }}>
              <Box component="fieldset">
                <Typography variant="caption" component="legend">
                  {t('Options')}
                </Typography>

                <FormControlLabel
                  label={t('Current view')}
                  control={
                    <Checkbox
                      size="small"
                      checked={useCurrentView}
                      onChange={(event) => {
                        handleUseCurrentViewChange(event.target.checked);
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label={t('Show grid')}
                  control={
                    <Checkbox
                      size="small"
                      checked={showGrid}
                      onChange={(event) => {
                        handleShowGridChange(event.target.checked);
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label={t('Background color')}
                  control={
                    <ColorPicker
                      value={backgroundColor}
                      onChange={handleBackgroundColorChange}
                    />
                  }
                />
              </Box>
            </Box>
            {imageData && (
              <Stack sx={{ width: '100%' }} alignItems="flex-end">
                <Stack direction="row" spacing={2}>
                  <Button variant="text" onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button onClick={downloadFile}>{t('Download as PNG')}</Button>
                </Stack>
              </Stack>
            )}
          </Stack>

          {exportError && (
            <Alert severity="error">{t('Could not export image')}</Alert>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
