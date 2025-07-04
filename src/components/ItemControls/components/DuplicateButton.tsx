import React from 'react';
import { ContentCopyOutlined as DuplicateIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  onClick: () => void;
}

export const DuplicateButton = ({ onClick }: Props) => {
  const { t } = useTranslation();
  return (
    <Button
      color="primary"
      size="small"
      variant="outlined"
      startIcon={<DuplicateIcon color="primary" />}
      onClick={onClick}
    >
      {t('Duplicate' as const)}
    </Button>
  );
};
