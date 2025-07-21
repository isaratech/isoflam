import React from 'react';
import {Box, IconButton, MenuItem, Select, Slider, ToggleButton, ToggleButtonGroup} from '@mui/material';
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
              <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center'}}>
                  <IconButton
                      size="small"
                      title={t('Bring to front')}
                      onClick={() => changeLayerOrder('BRING_TO_FRONT', {type: 'RECTANGLE', id: rectangle.id})}
                  >
                      <BringToFrontIcon/>
                  </IconButton>
                  <IconButton
                      size="small"
                      title={t('Bring forward')}
                      onClick={() => changeLayerOrder('BRING_FORWARD', {type: 'RECTANGLE', id: rectangle.id})}
                  >
                      <BringForwardIcon/>
                  </IconButton>
                  <IconButton
                      size="small"
                      title={t('Send backward')}
                      onClick={() => changeLayerOrder('SEND_BACKWARD', {type: 'RECTANGLE', id: rectangle.id})}
                  >
                      <SendBackwardIcon/>
                  </IconButton>
                  <IconButton
                      size="small"
                      title={t('Send to back')}
                      onClick={() => changeLayerOrder('SEND_TO_BACK', {type: 'RECTANGLE', id: rectangle.id})}
                  >
                      <SendToBackIcon/>
                  </IconButton>
              </Box>
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
                  <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center'}}>
                      <IconButton
                          size="small"
                          title={t('Rotate left 90°')}
                          onClick={() => {
                              const currentRotation = rectangle.rotationAngle || 0;
                              const newRotation = (currentRotation - 90 + 360) % 360;
                              updateRectangle(rectangle.id, {rotationAngle: newRotation});
                          }}
                      >
                          <RotateLeft/>
                      </IconButton>
                      <IconButton
                          size="small"
                          title={t('Rotate right 90°')}
                          onClick={() => {
                              const currentRotation = rectangle.rotationAngle || 0;
                              const newRotation = (currentRotation + 90) % 360;
                              updateRectangle(rectangle.id, {rotationAngle: newRotation});
                          }}
                      >
                          <RotateRight/>
                      </IconButton>
                  </Box>
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
