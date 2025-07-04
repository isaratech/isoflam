import React from 'react';
import { Box } from '@mui/material';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { ColorSwatch } from './ColorSwatch';

interface Props {
  onChange: (color: string) => void;
  activeColor?: string;
}

export const ColorSelector = ({ onChange, activeColor }: Props) => {
  const { t } = useTranslation();
  const { colors } = useScene();

  if (!colors || colors.length === 0) {
    return (
      <Box sx={{ p: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        {t('No colors available')}
      </Box>
    );
  }

  return (
    <Box>
      {colors.map((color) => {
        return (
          <ColorSwatch
            key={color.id}
            hex={color.value}
            onClick={() => {
              return onChange(color.id);
            }}
            isActive={activeColor === color.id}
          />
        );
      })}
    </Box>
  );
};
