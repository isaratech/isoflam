import React from 'react';
import { Box, Select, MenuItem, Slider, FormControlLabel, Switch } from '@mui/material';
import { useVolume } from 'src/hooks/useVolume';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { generateId } from 'src/utils';
import { Volume, rectangleStyleOptions } from 'src/types';
import { useTranslation } from 'src/hooks/useTranslation';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';
import { DuplicateButton } from '../components/DuplicateButton';
import { AdvancedSettings } from '../components/AdvancedSettings';

interface Props {
  id: string;
}

export const VolumeControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const volume = useVolume(id);
  const { updateVolume, deleteVolume, createVolume } = useScene();

  return (
    <ControlsContainer>
      {/* Basic controls */}
      <Section>
        <ColorSelector
          onChange={(color) => {
            updateVolume(volume.id, { color });
          }}
          activeColor={volume.color}
        />
      </Section>

      {/* Height control */}
      <Section title={t('Height')}>
        <Slider
          marks
          step={1}
          min={1}
          max={10}
          value={volume.height || 1}
          onChange={(e, newHeight) => {
            updateVolume(volume.id, { height: newHeight as number });
          }}
        />
      </Section>

      {/* Roof toggle */}
      <Section title={t('Roof')}>
        <FormControlLabel
          control={
            <Switch
              checked={volume.hasRoof}
              onChange={(e) => {
                updateVolume(volume.id, { hasRoof: e.target.checked });
              }}
            />
          }
          label={t('Show Roof')}
        />
      </Section>

      {/* Advanced settings */}
      <AdvancedSettings>
        <Section title={t('Style')}>
          <Select
            value={volume.style || 'SOLID'}
            onChange={(e) => {
              updateVolume(volume.id, {
                style: e.target.value as Volume['style']
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
        {volume.style && volume.style !== 'NONE' && (
          <Section title={t('Width')}>
            <Slider
              marks
              step={5}
              min={0}
              value={volume.width || 0}
              onChange={(e, newWidth) => {
                updateVolume(volume.id, { width: newWidth as number });
              }}
            />
          </Section>
        )}
        <Section title={t('Radius')}>
          <Slider
            marks
            step={20}
            min={-1}
            value={volume.radius || 20}
            onChange={(e, newRadius) => {
              updateVolume(volume.id, { radius: newRadius as number });
            }}
          />
        </Section>
      </AdvancedSettings>

      {/* Action buttons */}
      <Section>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          <DuplicateButton
            onClick={() => {
              // Create a duplicate of the volume with position in adjacent cell and a unique ID
              const newVolume = {
                ...volume,
                id: generateId(),
                from: {
                  x: volume.from.x + 1,
                  y: volume.from.y
                },
                to: {
                  x: volume.to.x + 1,
                  y: volume.to.y
                }
              };
              createVolume(newVolume);
            }}
          />
          <DeleteButton
            onClick={() => {
              uiStateActions.setItemControls(null);
              deleteVolume(volume.id);
            }}
          />
        </Box>
      </Section>
    </ControlsContainer>
  );
};