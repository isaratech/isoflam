import React from 'react';
import {
  Slider,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { SwapHoriz, SwapVert } from '@mui/icons-material';
import { ModelItem, ViewItem } from 'src/types';
import { MarkdownEditor } from 'src/components/MarkdownEditor/MarkdownEditor';
import { useModelItem } from 'src/hooks/useModelItem';
import { useIcon } from 'src/hooks/useIcon';
import { useTranslation } from 'src/hooks/useTranslation';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { DeleteButton } from '../../components/DeleteButton';
import { DuplicateButton } from '../../components/DuplicateButton';
import { Section } from '../../components/Section';
import { AdvancedSettings } from '../../components/AdvancedSettings';

export type NodeUpdates = {
  model: Partial<ModelItem>;
  view: Partial<ViewItem>;
};

interface Props {
  node: ViewItem;
  onModelItemUpdated: (updates: Partial<ModelItem>) => void;
  onViewItemUpdated: (updates: Partial<ViewItem>) => void;
  onDeleted: () => void;
  onDuplicated: () => void;
}

export const NodeSettings = ({
  node,
  onModelItemUpdated,
  onViewItemUpdated,
  onDeleted,
  onDuplicated
}: Props) => {
  const { t } = useTranslation();
  const modelItem = useModelItem(node.id);
  const { icon } = useIcon(modelItem.icon);

  return (
    <>
      {/* Basic controls */}
      <Section title={t('Label')}>
        <TextField
          value={modelItem.name}
          onChange={(e) => {
            const text = e.target.value as string;
            if (modelItem.name !== text) onModelItemUpdated({ name: text });
          }}
        />
      </Section>
      {modelItem.name && (
        <Section title={t('Label height')}>
          <Slider
            marks
            step={20}
            min={60}
            value={node.labelHeight}
            onChange={(e, newHeight) => {
              const labelHeight = newHeight as number;
              onViewItemUpdated({ labelHeight });
            }}
          />
        </Section>
      )}
      <Section title={t('Icon scale')}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Slider
              marks
              step={0.1}
              min={0.1}
              value={node.scaleFactor ?? 1}
              onChange={(e, newScale) => {
                const scaleFactor = newScale as number;
                // Calculate proportional label height based on scale factor
                // Use the default label height (80) as base and multiply by scale factor
                const baseLabelHeight = 80;
                const adjustedLabelHeight = Math.round(
                  baseLabelHeight * scaleFactor
                );
                onViewItemUpdated({
                  scaleFactor,
                  labelHeight: adjustedLabelHeight
                });
              }}
            />
          </Box>
          <TextField
            type="number"
            inputProps={{
              min: 0.1,
              step: 0.1
            }}
            value={node.scaleFactor ?? 1}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!Number.isNaN(value) && value >= 0.1) {
                const scaleFactor = value;
                const baseLabelHeight = 80;
                const adjustedLabelHeight = Math.round(
                  baseLabelHeight * scaleFactor
                );
                onViewItemUpdated({
                  scaleFactor,
                  labelHeight: adjustedLabelHeight
                });
              }
            }}
            sx={{ width: '80px' }}
          />
        </Box>
      </Section>
      {icon.colorizable !== false && (
        <Section>
          <ColorSelector
            onChange={(color) => {
              onViewItemUpdated({ color });
            }}
            activeColor={node.color}
          />
        </Section>
      )}

      {/* Advanced settings */}
      <AdvancedSettings>
        <Section title={t('Description')}>
          <MarkdownEditor
            value={modelItem.description}
            onChange={(text) => {
              if (modelItem.description !== text)
                onModelItemUpdated({ description: text });
            }}
          />
        </Section>
        <Section title={t('Mirroring')}>
          <ToggleButtonGroup
            value={[
              node.mirrorHorizontal ? 'horizontal' : null,
              node.mirrorVertical ? 'vertical' : null
            ].filter(Boolean)}
            onChange={(e, newValues) => {
              const hasHorizontal = newValues.includes('horizontal');
              const hasVertical = newValues.includes('vertical');

              if (
                hasHorizontal !== node.mirrorHorizontal ||
                hasVertical !== node.mirrorVertical
              ) {
                onViewItemUpdated({
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
      </AdvancedSettings>

      {/* Action buttons */}
      <Section>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <DuplicateButton onClick={onDuplicated} />
          <DeleteButton onClick={onDeleted} />
        </Box>
      </Section>
    </>
  );
};
