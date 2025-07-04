import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const Searchbox = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      placeholder={t('Search icons')}
      value={value}
      onChange={(e) => {
        return onChange(e.target.value as string);
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        )
      }}
    />
  );
};
