import React from 'react';
import { ViewInAr as VolumeIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  onClick: () => void;
}

export const ConvertButton = ({ onClick }: Props) => {
  const { t } = useTranslation();
  return (
    <Button
      color="primary"
      size="small"
      variant="outlined"
      startIcon={<VolumeIcon color="primary" />}
      onClick={onClick}
    >
      {t('Convert to Volume' as const)}
    </Button>
  );
};