import React from 'react';
import { Box } from '@mui/material';
import { useScene } from 'src/hooks/useScene';
import { ColorSwatch } from './ColorSwatch';

interface Props {
  onChange: (color: string) => void;
  activeColor?: string;
}

export const ColorSelector = ({ onChange, activeColor }: Props) => {
  const { colors } = useScene();

  if (!colors || colors.length === 0) {
    return (
      <Box sx={{ p: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        No colors available
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
