import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  Stack,
  Alert,
  TextField,
  CircularProgress,
  Typography,
  Snackbar
} from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';
import { useScene } from 'src/hooks/useScene';
import { createSceneShare, getShareableUrl } from 'src/utils/pastebin';
import { useTranslation } from 'src/hooks/useTranslation';
import { useModelStore } from 'src/stores/modelStore';
import { useSceneStore } from 'src/stores/sceneStore';

interface Props {
  onClose: () => void;
}

export const ShareDialog = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const scene = useScene();
  const modelData = useModelStore(state => state);
  const sceneData = useSceneStore(state => state);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const generateShareableLink = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!sceneData) {
          throw new Error('Could not get scene data');
        }
        
        // Create a shareable link using Pastebin with both scene and model data
        const result = await createSceneShare(sceneData, modelData);
        
        if (!result.success || !result.pasteKey) {
          throw new Error(result.message || 'Failed to create shareable link');
        }
        
        // Generate a shareable URL with the paste key
        const shareableUrl = getShareableUrl(result.pasteKey);
        setShareableLink(shareableUrl);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    generateShareableLink();
  }, [scene, sceneData, modelData]);

  const handleCopyToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          setCopySuccess(true);
        })
        .catch(() => {
          setError('Failed to copy to clipboard');
        });
    }
  };

  const handleSnackbarClose = () => {
    setCopySuccess(false);
  };

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="md">
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <ShareIcon />
            <Typography>{t('Share Scene')}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ minWidth: '400px' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">
                {t('Error creating shareable link')}: {error}
              </Alert>
            ) : shareableLink ? (
              <>
                <Alert severity="success">
                  {t(
                    'Your scene is now shareable! Copy the link below to share it with others.'
                  )}
                </Alert>
                
                <TextField
                  fullWidth
                  label={t('Shareable Link')}
                  value={shareableLink}
                  InputProps={{
                    readOnly: true
                  }}
                />
                
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="text" onClick={onClose}>
                    {t('Close')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCopyToClipboard}
                    startIcon={<ShareIcon />}
                  >
                    {t('Copy to Clipboard')}
                  </Button>
                </Stack>
              </>
            ) : (
              <Alert severity="error">
                {t('Something went wrong. Please try again.')}
              </Alert>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
      
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={t('Link copied to clipboard!')}
      />
    </>
  );
};