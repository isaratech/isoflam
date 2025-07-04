import React from 'react';
import { ProjectionOrientationEnum } from 'src/types';
import {
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Slider
} from '@mui/material';
import { TextRotationNone as TextRotationNoneIcon } from '@mui/icons-material';
import { useTextBox } from 'src/hooks/useTextBox';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { getIsoProjectionCss, generateId } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';
import { DuplicateButton } from '../components/DuplicateButton';

interface Props {
  id: string;
}

export const TextBoxControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const textBox = useTextBox(id);
  const { updateTextBox, deleteTextBox, createTextBox } = useScene();

  return (
    <ControlsContainer>
      <Section>
        <TextField
          value={textBox.content}
          onChange={(e) => {
            updateTextBox(textBox.id, { content: e.target.value as string });
          }}
        />
      </Section>
      <Section>
        <ColorSelector
          onChange={(color) => {
            updateTextBox(textBox.id, { color });
          }}
          activeColor={textBox.color}
        />
      </Section>
      <Section title={t('Text size')}>
        <Slider
          marks
          step={0.3}
          min={0.3}
          max={1.2}
          value={textBox.fontSize}
          onChange={(e, newSize) => {
            updateTextBox(textBox.id, { fontSize: newSize as number });
          }}
        />
      </Section>
      <Section title={t('Alignment')}>
        <ToggleButtonGroup
          value={textBox.orientation}
          exclusive
          onChange={(e, orientation) => {
            if (textBox.orientation === orientation || orientation === null)
              return;

            updateTextBox(textBox.id, { orientation });
          }}
        >
          <ToggleButton value={ProjectionOrientationEnum.X}>
            <TextRotationNoneIcon sx={{ transform: getIsoProjectionCss() }} />
          </ToggleButton>
          <ToggleButton value={ProjectionOrientationEnum.Y}>
            <TextRotationNoneIcon
              sx={{
                transform: `scale(-1, 1) ${getIsoProjectionCss()} scale(-1, 1)`
              }}
            />
          </ToggleButton>
        </ToggleButtonGroup>
      </Section>
      <Section>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <DuplicateButton
            onClick={() => {
              // Create a duplicate of the text box with position in adjacent cell and a unique ID
              const newTextBox = {
                ...textBox,
                id: generateId(),
                tile: {
                  x: textBox.tile.x + 1,
                  y: textBox.tile.y
                }
              };
              createTextBox(newTextBox);
            }}
          />
          <DeleteButton
            onClick={() => {
              uiStateActions.setItemControls(null);
              deleteTextBox(textBox.id);
            }}
          />
        </Box>
      </Section>
    </ControlsContainer>
  );
};
