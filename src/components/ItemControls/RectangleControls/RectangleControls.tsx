import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Slider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  RotateLeft,
  RotateRight,
  SwapHoriz,
  SwapVert
} from '@mui/icons-material';
import { useRectangle } from 'src/hooks/useRectangle';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { generateId, isVolume } from 'src/utils';
import { Rectangle, rectangleStyleOptions } from 'src/types';
import { useTranslation } from 'src/hooks/useTranslation';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';
import { DuplicateButton } from '../components/DuplicateButton';
import { AdvancedSettings } from '../components/AdvancedSettings';
import { LayerControls } from '../components/LayerControls';
import { BuildingControls } from './BuildingControls';

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

  // Images and roads are drawn with their own content instead of a plain colour
  const hasPlainFill = !rectangle.imageData && !rectangle.texture;

  return (
    <ControlsContainer>
      {/* Basic controls */}
      {hasPlainFill && (
        <Section>
          <ColorSelector
            onChange={(color) => {
              updateRectangle(rectangle.id, { color });
            }}
            activeColor={rectangle.color}
          />
        </Section>
      )}

      {/* Volume controls - not for images and roads */}
      {hasPlainFill && (
        <Section title={t('Height')}>
          <Slider
            marks
            step={1}
            min={0}
            max={20}
            valueLabelDisplay="auto"
            value={rectangle.height}
            onChange={(e, newHeight) => {
              updateRectangle(rectangle.id, { height: newHeight as number });
            }}
          />
        </Section>
      )}
      {isVolume(rectangle) && (
        <Section>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(rectangle.building)}
                onChange={(e) => {
                  updateRectangle(rectangle.id, {
                    building: e.target.checked ? {} : undefined
                  });
                }}
              />
            }
            label={t('Building')}
          />
        </Section>
      )}
      {isVolume(rectangle) && !rectangle.building && (
        <Section title={t('Roof')}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rectangle.roof}
                onChange={(e) => {
                  updateRectangle(rectangle.id, { roof: e.target.checked });
                }}
              />
            }
            label={t('Closed volume')}
          />
        </Section>
      )}
      {isVolume(rectangle) && rectangle.building && (
        <BuildingControls
          building={rectangle.building}
          onChange={(updates) => {
            updateRectangle(rectangle.id, {
              building: { ...rectangle.building, ...updates }
            });
          }}
        />
      )}

      {/* Quick rotation controls (90°) - only for images */}
      {rectangle.imageData && (
        <Section title={t('Rotation')}>
          <ToggleButtonGroup
            value={[]} // No persistent selection for action buttons
            onChange={(e) => {
              // Handle rotation actions based on the clicked button
              const target = e.target as HTMLElement;
              const button = target.closest('[data-rotation]') as HTMLElement;
              if (button) {
                const direction = button.getAttribute('data-rotation');
                const currentRotation = rectangle.rotationAngle || 0;
                const newRotation =
                  direction === 'left'
                    ? (currentRotation - 90 + 360) % 360
                    : (currentRotation + 90) % 360;
                updateRectangle(rectangle.id, { rotationAngle: newRotation });
              }
            }}
          >
            <ToggleButton
              value="rotate-left"
              data-rotation="left"
              title={t('Rotate left 90°')}
            >
              <RotateLeft />
            </ToggleButton>
            <ToggleButton
              value="rotate-right"
              data-rotation="right"
              title={t('Rotate right 90°')}
            >
              <RotateRight />
            </ToggleButton>
          </ToggleButtonGroup>
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
        {/* Volumes and roads have sharp corners */}
        {!isVolume(rectangle) && !rectangle.texture && (
          <Section title={t('Radius')}>
            <Slider
              marks
              step={20}
              min={0}
              value={rectangle.radius}
              onChange={(e, newRadius) => {
                updateRectangle(rectangle.id, { radius: newRadius as number });
              }}
            />
          </Section>
        )}

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
                <SwapHoriz />
              </ToggleButton>
              <ToggleButton value="vertical">
                <SwapVert />
              </ToggleButton>
            </ToggleButtonGroup>
          </Section>
        )}

        {/* Isometric mode toggle - only for images */}
        {rectangle.imageData && (
          <Section title={t('Projection')}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rectangle.isometric !== false} // Default to true if undefined
                  onChange={(e) => {
                    updateRectangle(rectangle.id, {
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
        {rectangle.imageData && (
          <Section title={t('Rotation')}>
            <ToggleButtonGroup
              value={[]} // No persistent selection for action buttons
              onChange={(e) => {
                // Handle rotation actions based on the clicked button
                const target = e.target as HTMLElement;
                const button = target.closest(
                  '[data-rotation-fine]'
                ) as HTMLElement;
                if (button) {
                  const direction = button.getAttribute('data-rotation-fine');
                  const angle = button.getAttribute('data-rotation-angle');
                  const rotationAngle = parseInt(angle || '10', 10);
                  const currentRotation = rectangle.rotationAngle || 0;
                  const newRotation =
                    direction === 'left'
                      ? (currentRotation - rotationAngle + 360) % 360
                      : (currentRotation + rotationAngle) % 360;
                  updateRectangle(rectangle.id, { rotationAngle: newRotation });
                }
              }}
            >
              <ToggleButton
                value="rotate-left-10"
                data-rotation-fine="left"
                data-rotation-angle="10"
                title={t('Rotate left 10°')}
              >
                10°&nbsp;
                <RotateLeft />
              </ToggleButton>

              <ToggleButton
                value="rotate-left-5"
                data-rotation-fine="left"
                data-rotation-angle="5"
                title={t('Rotate left 5°')}
              >
                5°&nbsp;
                <RotateLeft />
              </ToggleButton>
              <ToggleButton
                value="rotate-right-5"
                data-rotation-fine="right"
                data-rotation-angle="5"
                title={t('Rotate right 5°')}
              >
                <RotateRight />
                &nbsp;5°
              </ToggleButton>
              <ToggleButton
                value="rotate-right-10"
                data-rotation-fine="right"
                data-rotation-angle="10"
                title={t('Rotate right 10°')}
              >
                <RotateRight />
                &nbsp;10°
              </ToggleButton>
            </ToggleButtonGroup>
          </Section>
        )}
      </AdvancedSettings>

      <LayerControls item={{ type: 'RECTANGLE', id: rectangle.id }} />

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
