import React from 'react';
import {Box, Checkbox, FormControlLabel, MenuItem, Select, Slider, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {
    FlipToBack as SendToBackIcon,
    FlipToFront as BringToFrontIcon,
    KeyboardArrowDown as SendBackwardIcon,
    KeyboardArrowUp as BringForwardIcon,
    RotateLeft,
    RotateRight,
    SwapHoriz,
    SwapVert
} from '@mui/icons-material';
import {useVolume} from 'src/hooks/useVolume';
import {ColorSelector} from 'src/components/ColorSelector/ColorSelector';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useScene} from 'src/hooks/useScene';
import {generateId} from 'src/utils';
import {Volume, volumeStyleOptions} from 'src/types';
import {useTranslation} from 'src/hooks/useTranslation';
import {ControlsContainer} from '../components/ControlsContainer';
import {Section} from '../components/Section';
import {DeleteButton} from '../components/DeleteButton';
import {DuplicateButton} from '../components/DuplicateButton';
import {AdvancedSettings} from '../components/AdvancedSettings';

interface Props {
  id: string;
}

export const VolumeControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const volume = useVolume(id);
  const {updateVolume, deleteVolume, createVolume, changeLayerOrder} = useScene();

  return (
    <ControlsContainer>
      {/* Basic controls */}
      {!volume.imageData && (
        <Section>
          <ColorSelector
            onChange={(color) => {
              updateVolume(volume.id, {color});
            }}
            activeColor={volume.color}
          />
        </Section>
      )}

      {/* Height control - main feature for volumes */}
      <Section title={t('Height')}>
        <Slider
          marks
          step={0.5}
          min={0.5}
          max={10}
          value={volume.height || 1}
          onChange={(e, newHeight) => {
            updateVolume(volume.id, { height: newHeight as number });
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}${t(' units')}`}
        />
      </Section>

      {/* Quick rotation controls (90°) - only for images */}
      {volume.imageData && (
        <Section title={t('Rotation')}>
          <ToggleButtonGroup
            value={[]} // No persistent selection for action buttons
            onChange={(e, newValues) => {
              // Handle rotation actions based on the clicked button
              const target = e.target as HTMLElement;
              const button = target.closest('[data-rotation]') as HTMLElement;
              if (button) {
                const direction = button.getAttribute('data-rotation');
                const currentRotation = volume.rotationAngle || 0;
                const newRotation = direction === 'left'
                  ? (currentRotation - 90 + 360) % 360
                  : (currentRotation + 90) % 360;
                updateVolume(volume.id, {rotationAngle: newRotation});
              }
            }}
          >
            <ToggleButton
              value="rotate-left"
              data-rotation="left"
              title={t('Rotate left 90°')}
            >
              <RotateLeft/>
            </ToggleButton>
            <ToggleButton
              value="rotate-right"
              data-rotation="right"
              title={t('Rotate right 90°')}
            >
              <RotateRight/>
            </ToggleButton>
          </ToggleButtonGroup>
        </Section>
      )}

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
            {Object.values(volumeStyleOptions).map((style) => {
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

        {/* Layer controls */}
        <Section title={t('Layer')}>
          <ToggleButtonGroup
            value={[]} // No persistent selection for action buttons
            onChange={(e, newValues) => {
              // Handle layer actions based on the clicked button
              const target = e.target as HTMLElement;
              const button = target.closest('[data-layer-action]') as HTMLElement;
              if (button) {
                const action = button.getAttribute('data-layer-action');
                switch (action) {
                  case 'BRING_TO_FRONT':
                    changeLayerOrder('BRING_TO_FRONT', {type: 'VOLUME', id: volume.id});
                    break;
                  case 'BRING_FORWARD':
                    changeLayerOrder('BRING_FORWARD', {type: 'VOLUME', id: volume.id});
                    break;
                  case 'SEND_BACKWARD':
                    changeLayerOrder('SEND_BACKWARD', {type: 'VOLUME', id: volume.id});
                    break;
                  case 'SEND_TO_BACK':
                    changeLayerOrder('SEND_TO_BACK', {type: 'VOLUME', id: volume.id});
                    break;
                }
              }
            }}
          >
            <ToggleButton
              value="bring-to-front"
              data-layer-action="BRING_TO_FRONT"
              title={t('Bring to front')}
            >
              <BringToFrontIcon/>
            </ToggleButton>
            <ToggleButton
              value="bring-forward"
              data-layer-action="BRING_FORWARD"
              title={t('Bring forward')}
            >
              <BringForwardIcon/>
            </ToggleButton>
            <ToggleButton
              value="send-backward"
              data-layer-action="SEND_BACKWARD"
              title={t('Send backward')}
            >
              <SendBackwardIcon/>
            </ToggleButton>
            <ToggleButton
              value="send-to-back"
              data-layer-action="SEND_TO_BACK"
              title={t('Send to back')}
            >
              <SendToBackIcon/>
            </ToggleButton>
          </ToggleButtonGroup>
        </Section>

        {/* Mirroring controls - only for images */}
        {volume.imageData && (
          <Section title={t('Mirroring')}>
            <ToggleButtonGroup
              value={[
                volume.mirrorHorizontal ? 'horizontal' : null,
                volume.mirrorVertical ? 'vertical' : null
              ].filter(Boolean)}
              onChange={(e, newValues) => {
                const hasHorizontal = newValues.includes('horizontal');
                const hasVertical = newValues.includes('vertical');

                if (
                  hasHorizontal !== volume.mirrorHorizontal ||
                  hasVertical !== volume.mirrorVertical
                ) {
                  updateVolume(volume.id, {
                    mirrorHorizontal: hasHorizontal,
                    mirrorVertical: hasVertical
                  });
                }
              }}
            >
              <ToggleButton value="horizontal">
                <SwapHoriz/>
              </ToggleButton>
              <ToggleButton value="vertical">
                <SwapVert/>
              </ToggleButton>
            </ToggleButtonGroup>
          </Section>
        )}

        {/* Isometric mode toggle - only for images */}
        {volume.imageData && (
          <Section title={t('Projection')}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={volume.isometric !== false} // Default to true if undefined
                  onChange={(e) => {
                    updateVolume(volume.id, {
                      isometric: e.target.checked
                    });
                  }}
                />
              }
              label={t('Isometric')}
            />
          </Section>
        )}

        {/* Fine rotation controls (10° and 5°) - only for images */}
        {volume.imageData && (
          <Section title={t('Rotation')}>
            <ToggleButtonGroup
              value={[]} // No persistent selection for action buttons
              onChange={(e, newValues) => {
                // Handle rotation actions based on the clicked button
                const target = e.target as HTMLElement;
                const button = target.closest('[data-rotation-fine]') as HTMLElement;
                if (button) {
                  const direction = button.getAttribute('data-rotation-fine');
                  const angle = button.getAttribute('data-rotation-angle');
                  const rotationAngle = parseInt(angle || '10', 10);
                  const currentRotation = volume.rotationAngle || 0;
                  const newRotation = direction === 'left'
                    ? (currentRotation - rotationAngle + 360) % 360
                    : (currentRotation + rotationAngle) % 360;
                  updateVolume(volume.id, {rotationAngle: newRotation});
                }
              }}
            >
              <ToggleButton
                value="rotate-left-10"
                data-rotation-fine="left"
                data-rotation-angle="10"
                title={t('Rotate left 10°')}
              >
                10°&nbsp;<RotateLeft/>
              </ToggleButton>

              <ToggleButton
                value="rotate-left-5"
                data-rotation-fine="left"
                data-rotation-angle="5"
                title={t('Rotate left 5°')}
              >
                5°&nbsp;<RotateLeft/>
              </ToggleButton>
              <ToggleButton
                value="rotate-right-5"
                data-rotation-fine="right"
                data-rotation-angle="5"
                title={t('Rotate right 5°')}
              >
                <RotateRight/>&nbsp;5°
              </ToggleButton>
              <ToggleButton
                value="rotate-right-10"
                data-rotation-fine="right"
                data-rotation-angle="10"
                title={t('Rotate right 10°')}
              >
                <RotateRight/>&nbsp;10°
              </ToggleButton>
            </ToggleButtonGroup>
          </Section>
        )}
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