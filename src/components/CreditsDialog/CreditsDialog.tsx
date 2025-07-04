import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Link,
  Box
} from '@mui/material';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  onClose: () => void;
}

export const CreditsDialog = ({ onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{t('Credits')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('SDMIS Icons')}
          </Typography>
          <Typography variant="body2" paragraph>
            ©{' '}
            {t(
              "Service Départemental-Métropolitain d'Incendie et de Secours (SDMIS), 2023. All rights reserved."
            )}
          </Typography>
          <Typography variant="body2" paragraph>
            {t('Licensed under')}:{' '}
            <Link
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(
                'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)'
              )}
            </Link>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
