import React from 'react';
import { DeleteOutlined as DeleteIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  onClick: () => void;
}

export const DeleteButton = ({ onClick }: Props) => {
  const { t } = useTranslation();
  return (
    <Button
      color="error"
      size="small"
      variant="outlined"
      startIcon={<DeleteIcon color="error" />}
      onClick={onClick}
    >
      {t('Delete')}
    </Button>
  );
};
