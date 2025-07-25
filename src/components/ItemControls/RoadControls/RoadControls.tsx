import React from 'react';
import {Road, roadStyleOptions} from 'src/types';
import {Box, MenuItem, Select, Slider, TextField} from '@mui/material';
import {useRoad} from 'src/hooks/useRoad';
import {ColorSelector} from 'src/components/ColorSelector/ColorSelector';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useScene} from 'src/hooks/useScene';
import {useTranslation} from 'src/hooks/useTranslation';
import {ControlsContainer} from '../components/ControlsContainer';
import {Section} from '../components/Section';
import {DeleteButton} from '../components/DeleteButton';
import {AdvancedSettings} from '../components/AdvancedSettings';

interface Props {
  id: string;
}

export const RoadControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const road = useRoad(id);
  const { updateRoad, deleteRoad } = useScene();

  return (
    <ControlsContainer>
      {/* Basic controls */}
      <Section>
        <TextField
          label={t('Description')}
          value={road.description || ''}
          onChange={(e) => {
            updateRoad(road.id, {
              description: e.target.value as string
            });
          }}
        />
      </Section>
      <Section>
        <ColorSelector
          onChange={(color) => {
            return updateRoad(road.id, { color });
          }}
          activeColor={road.color}
        />
      </Section>
      <Section title={t('Width')}>
        <Slider
          marks
          step={1}
          min={2}
          max={10}
          value={road.width || 2}
          onChange={(e, newWidth) => {
            updateRoad(road.id, { width: newWidth as number });
          }}
        />
      </Section>

      {/* Advanced settings */}
      <AdvancedSettings>
        <Section title={t('Style')}>
          <Select
            value={road.style || 'SOLID'}
            onChange={(e) => {
              updateRoad(road.id, {
                style: e.target.value as Road['style']
              });
            }}
          >
            {Object.values(roadStyleOptions).map((style) => {
                return <MenuItem key={style} value={style}>{t(style)}</MenuItem>;
            })}
          </Select>
        </Section>
      </AdvancedSettings>

      {/* Action buttons */}
      <Section>
        <Box>
          <DeleteButton
            onClick={() => {
              uiStateActions.setItemControls(null);
              deleteRoad(road.id);
            }}
          />
        </Box>
      </Section>
    </ControlsContainer>
  );
};