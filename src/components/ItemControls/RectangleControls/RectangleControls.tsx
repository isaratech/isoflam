import React from 'react';
import {Box, MenuItem, Select, Slider, ToggleButton, ToggleButtonGroup} from '@mui/material';
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
import {useRectangle} from 'src/hooks/useRectangle';
import {ColorSelector} from 'src/components/ColorSelector/ColorSelector';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useScene} from 'src/hooks/useScene';
import {generateId} from 'src/utils';
import {Rectangle, rectangleStyleOptions} from 'src/types';
import {useTranslation} from 'src/hooks/useTranslation';
import {ControlsContainer} from '../components/ControlsContainer';
import {Section} from '../components/Section';
import {DeleteButton} from '../components/DeleteButton';
import {DuplicateButton} from '../components/DuplicateButton';
import {AdvancedSettings} from '../components/AdvancedSettings';

interface Props {
  id: string;
}

export const RectangleControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const rectangle = useRectangle(id);
    const {updateRectangle, deleteRectangle, createRectangle, changeLayerOrder} = useScene();

  return (
    <ControlsContainer>
      {/* Basic controls */}
        {!rectangle.imageData && (
            <Section>
                <ColorSelector
                    onChange={(color) => {
                        updateRectangle(rectangle.id, {color});
                    }}
                    activeColor={rectangle.color}
                />
            </Section>
        )}

      {/* Advanced settings */}
      <AdvancedSettings>
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
        {rectangle.style && rectangle.style !== 'NONE' && (
          <Section title={t('Width')}>
            <Slider
              marks
              step={5}
              min={0}
              value={rectangle.width || 0}
              onChange={(e, newWidth) => {
                updateRectangle(rectangle.id, { width: newWidth as number });
              }}
            />
          </Section>
        )}
        <Section title={t('Radius')}>
          <Slider
            marks
            step={20}
            min={-1}
            value={rectangle.radius || 20}
            onChange={(e, newRadius) => {
              updateRectangle(rectangle.id, { radius: newRadius as number });
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
                                  changeLayerOrder('BRING_TO_FRONT', {type: 'RECTANGLE', id: rectangle.id});
                                  break;
                              case 'BRING_FORWARD':
                                  changeLayerOrder('BRING_FORWARD', {type: 'RECTANGLE', id: rectangle.id});
                                  break;
                              case 'SEND_BACKWARD':
                                  changeLayerOrder('SEND_BACKWARD', {type: 'RECTANGLE', id: rectangle.id});
                                  break;
                              case 'SEND_TO_BACK':
                                  changeLayerOrder('SEND_TO_BACK', {type: 'RECTANGLE', id: rectangle.id});
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
          {rectangle.imageData && (
              <Section title={t('Mirroring')}>
                  <ToggleButtonGroup
                      value={[
                          rectangle.mirrorHorizontal ? 'horizontal' : null,
                          rectangle.mirrorVertical ? 'vertical' : null
                      ].filter(Boolean)}
                      onChange={(e, newValues) => {
                          const hasHorizontal = newValues.includes('horizontal');
                          const hasVertical = newValues.includes('vertical');

                          if (
                              hasHorizontal !== rectangle.mirrorHorizontal ||
                              hasVertical !== rectangle.mirrorVertical
                          ) {
                              updateRectangle(rectangle.id, {
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

          {/* Rotation controls - only for images */}
          {rectangle.imageData && (
              <Section title={t('Rotation')}>
                  <ToggleButtonGroup
                      value={[]} // No persistent selection for action buttons
                      onChange={(e, newValues) => {
                          // Handle rotation actions based on the clicked button
                          const target = e.target as HTMLElement;
                          const button = target.closest('[data-rotation]') as HTMLElement;
                          if (button) {
                              const direction = button.getAttribute('data-rotation');
                              const currentRotation = rectangle.rotationAngle || 0;
                              const newRotation = direction === 'left'
                                  ? (currentRotation - 90 + 360) % 360
                                  : (currentRotation + 90) % 360;
                              updateRectangle(rectangle.id, {rotationAngle: newRotation});
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
      </AdvancedSettings>

      {/* Action buttons */}
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
