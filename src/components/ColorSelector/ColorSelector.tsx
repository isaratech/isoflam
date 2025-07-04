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

  // Debug logging to help identify the issue
  console.log('[DEBUG_LOG] ColorSelector rendering with colors:', colors);
  console.log('[DEBUG_LOG] ColorSelector activeColor:', activeColor);

  if (!colors || colors.length === 0) {
    console.log('[DEBUG_LOG] ColorSelector: No colors available');
    return (
      <Box sx={{ p: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        No colors available
      </Box>
    );
  }

  return (
    <Box>
      {colors.map((color) => {
        console.log('[DEBUG_LOG] ColorSelector rendering color:', color);
        return (
          <ColorSwatch
            key={color.id}
            hex={color.value}
            onClick={() => {
              console.log('[DEBUG_LOG] ColorSelector color clicked:', color.id);
              return onChange(color.id);
            }}
            isActive={activeColor === color.id}
          />
        );
      })}
    </Box>
  );
};
