import React from 'react';
import { Connector, connectorStyleOptions } from 'src/types';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Slider,
  TextField
} from '@mui/material';
import { useConnector } from 'src/hooks/useConnector';
import { getRoadWidth, getWallHeight, isRoad } from 'src/utils';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';
import { AdvancedSettings } from '../components/AdvancedSettings';
import { LayerControls } from '../components/LayerControls';

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
  // A road's look is fixed: it only has a name
  const isRoadConnector = isRoad(connector);
  const isWall = getWallHeight(connector) > 0;

  return (
    <ControlsContainer>
      {/* Basic controls */}
      <Section>
        <TextField
          label={isRoadConnector ? t('Street name') : t('Description')}
          value={connector.description}
          onChange={(e) => {
            updateConnector(connector.id, {
              description: e.target.value as string
            });
          }}
        />
      </Section>
      {isRoadConnector && (
        <>
          <Section title={t('Road width')}>
            <Slider
              marks
              step={1}
              min={1}
              max={10}
              valueLabelDisplay="auto"
              value={getRoadWidth(connector)}
              onChange={(e, newWidth) => {
                updateConnector(connector.id, {
                  roadWidth: newWidth as number
                });
              }}
            />
          </Section>
          <Section>
            <FormControlLabel
              control={
                <Checkbox
                  checked={connector.sidewalks ?? false}
                  onChange={(e) => {
                    updateConnector(connector.id, {
                      sidewalks: e.target.checked
                    });
                  }}
                />
              }
              label={t('Sidewalks')}
            />
          </Section>
        </>
      )}
      {!isRoadConnector && (
        <>
          <Section>
            <ColorSelector
              onChange={(color) => {
                return updateConnector(connector.id, { color });
              }}
              activeColor={connector.color}
            />
          </Section>
          {/* A wall is a solid prism: the line style doesn't apply */}
          {!isWall && (
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
                  return (
                    <MenuItem key={style} value={style}>
                      {t(style)}
                    </MenuItem>
                  );
                })}
              </Select>
            </Section>
          )}
          <Section title={t('Wall height')}>
            <Slider
              marks
              step={1}
              min={0}
              max={10}
              valueLabelDisplay="auto"
              value={connector.height}
              onChange={(e, newHeight) => {
                updateConnector(connector.id, { height: newHeight as number });
              }}
            />
          </Section>

          {/* Advanced settings */}
          <AdvancedSettings>
            <Section title={isWall ? t('Wall thickness') : t('Width')}>
              <Slider
                marks
                step={10}
                min={10}
                value={connector.width}
                onChange={(e, newWidth) => {
                  updateConnector(connector.id, { width: newWidth as number });
                }}
              />
            </Section>
            {!isWall && (
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
            )}
          </AdvancedSettings>
        </>
      )}

      <LayerControls item={{ type: 'CONNECTOR', id: connector.id }} />

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
