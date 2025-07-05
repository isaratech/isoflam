import React from 'react';
import { Box, Select, MenuItem } from '@mui/material';
import { useRectangle } from 'src/hooks/useRectangle';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { generateId } from 'src/utils';
import { Rectangle, rectangleStyleOptions } from 'src/types';
import { useTranslation } from 'src/hooks/useTranslation';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';
import { DuplicateButton } from '../components/DuplicateButton';

interface Props {
  id: string;
}

export const RectangleControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const rectangle = useRectangle(id);
  const { updateRectangle, deleteRectangle, createRectangle } = useScene();

  return (
    <ControlsContainer>
      <Section>
        <ColorSelector
          onChange={(color) => {
            updateRectangle(rectangle.id, { color });
          }}
          activeColor={rectangle.color}
        />
      </Section>
      <Section title={t('Style')}>
        <Select
          value={rectangle.style || 'SOLID'}
          onChange={(e) => {
            updateRectangle(rectangle.id, {
              style: e.target.value as Rectangle['style']
            });
          }}
        >
          {Object.values(rectangleStyleOptions).map((style) => {
            return (
              <MenuItem key={style} value={style}>
                {t(style)}
              </MenuItem>
            );
          })}
        </Select>
      </Section>
      <Section>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          <DuplicateButton
            onClick={() => {
              // Create a duplicate of the rectangle with position in adjacent cell and a unique ID
              const newRectangle = {
                ...rectangle,
                id: generateId(),
                from: {
                  x: rectangle.from.x + 1,
                  y: rectangle.from.y
                },
                to: {
                  x: rectangle.to.x + 1,
                  y: rectangle.to.y
                }
              };
              createRectangle(newRectangle);
            }}
          />
          <DeleteButton
            onClick={() => {
              uiStateActions.setItemControls(null);
              deleteRectangle(rectangle.id);
            }}
          />
        </Box>
      </Section>
    </ControlsContainer>
  );
};
