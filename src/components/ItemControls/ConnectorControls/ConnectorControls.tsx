import React from 'react';
import { Connector, connectorStyleOptions } from 'src/types';
import {
  Box,
  Slider,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useConnector } from 'src/hooks/useConnector';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';
import { AdvancedSettings } from '../components/AdvancedSettings';

interface Props {
  id: string;
}

export const ConnectorControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const connector = useConnector(id);
  const { updateConnector, deleteConnector } = useScene();

  return (
    <ControlsContainer>
      {/* Basic controls */}
      <Section>
        <TextField
          label={t('Description')}
          value={connector.description}
          onChange={(e) => {
            updateConnector(connector.id, {
              description: e.target.value as string
            });
          }}
        />
      </Section>
      <Section>
        <ColorSelector
          onChange={(color) => {
            return updateConnector(connector.id, { color });
          }}
          activeColor={connector.color}
        />
      </Section>
      <Section title={t('Style')}>
        <Select
          value={connector.style}
          onChange={(e) => {
            updateConnector(connector.id, {
              style: e.target.value as Connector['style']
            });
          }}
        >
          {Object.values(connectorStyleOptions).map((style) => {
            return <MenuItem value={style}>{t(style)}</MenuItem>;
          })}
        </Select>
      </Section>

      {/* Advanced settings */}
      <AdvancedSettings>
        <Section title={t('Width')}>
          <Slider
            marks
            step={10}
            min={10}
            max={100}
            value={connector.width}
            onChange={(e, newWidth) => {
              updateConnector(connector.id, { width: newWidth as number });
            }}
          />
        </Section>
        <Section title={t('Triangle')}>
          <FormControlLabel
            control={
              <Checkbox
                checked={connector.showTriangle ?? true}
                onChange={(e) => {
                  updateConnector(connector.id, {
                    showTriangle: e.target.checked
                  });
                }}
              />
            }
            label={t('Show triangle')}
          />
        </Section>
      </AdvancedSettings>

      {/* Action buttons */}
      <Section>
        <Box>
          <DeleteButton
            onClick={() => {
              uiStateActions.setItemControls(null);
              deleteConnector(connector.id);
            }}
          />
        </Box>
      </Section>
    </ControlsContainer>
  );
};
