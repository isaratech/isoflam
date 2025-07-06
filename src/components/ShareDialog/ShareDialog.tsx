import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  Stack,
  Alert,
  TextField,
  Typography,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Share as ShareIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useModelStore } from 'src/stores/modelStore';
import { generateShareableUrl, modelFromModelStore } from 'src/utils';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  onClose: () => void;
}

export const ShareDialog = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });

  // Generate shareable URL when component mounts
  useEffect(() => {
    try {
      const url = generateShareableUrl(model);
      setShareableUrl(url);
      setIsGenerating(false);
      
      if (!url) {
        setError(t('The scene is too large to share via URL. Try simplifying your scene.'));
      }
    } catch (err) {
      console.error('Error generating shareable URL:', err);
      setError(t('Failed to generate shareable URL'));
      setIsGenerating(false);
    }
  }, [model, t]);

  // Handle copying URL to clipboard
  const handleCopyUrl = useCallback(() => {
    if (!shareableUrl) return;
    
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 3000);
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
        setError(t('Failed to copy URL to clipboard'));
      });
  }, [shareableUrl, t]);

  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <ShareIcon />
          <Typography>{t('Share Scene')}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ minWidth: '500px' }}>
          <Typography variant="body1">
            {t('Share your scene with others by copying this link:')}
          </Typography>

          {isGenerating ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TextField
                fullWidth
                variant="outlined"
                value={shareableUrl || ''}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Button
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyUrl}
                      disabled={!shareableUrl}
                    >
                      {t('Copy')}
                    </Button>
                  )
                }}
              />
              
              <Alert severity="info">
                {t('Anyone with this link can view and edit this scene. The link contains all scene data compressed into the URL.')}
              </Alert>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>{t('Close')}</Button>
          </Box>
        </Stack>
      </DialogContent>
      
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => {
          setCopySuccess(false);
        }}
        message={t('Link copied to clipboard')}
      />
    </Dialog>
  );
};