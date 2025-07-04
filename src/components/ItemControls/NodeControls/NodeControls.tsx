import React, { useState, useCallback } from 'react';
import { Box, Stack, Button } from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useIconCategories } from 'src/hooks/useIconCategories';
import { useIcon } from 'src/hooks/useIcon';
import { useScene } from 'src/hooks/useScene';
import { useViewItem } from 'src/hooks/useViewItem';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useModelItem } from 'src/hooks/useModelItem';
import { useTranslation } from 'src/hooks/useTranslation';
import { generateId } from 'src/utils';
import { ControlsContainer } from '../components/ControlsContainer';
import { Icons } from '../IconSelectionControls/Icons';
import { NodeSettings } from './NodeSettings/NodeSettings';
import { Section } from '../components/Section';

interface Props {
  id: string;
}

const ModeOptions = {
  SETTINGS: 'SETTINGS',
  CHANGE_ICON: 'CHANGE_ICON'
} as const;

type Mode = keyof typeof ModeOptions;

export const NodeControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('SETTINGS');
  const {
    updateModelItem,
    updateViewItem,
    deleteViewItem,
    createModelItem,
    createViewItem
  } = useScene();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const viewItem = useViewItem(id);
  const modelItem = useModelItem(id);
  const { iconCategories } = useIconCategories();
  const { icon } = useIcon(modelItem.icon);

  const onSwitchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
  }, []);

  return (
    <ControlsContainer>
      <Box
        sx={{
          bgcolor: (theme) => {
            return theme.customVars.customPalette.diagramBg;
          }
        }}
      >
        <Section sx={{ py: 2 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-end"
            justifyContent="space-between"
          >
            <Box
              component="img"
              src={icon.url}
              alt={icon.name || 'Node icon'}
              sx={{ width: 70, height: 70 }}
            />
            {mode === 'SETTINGS' && (
              <Button
                endIcon={<ChevronRightIcon />}
                onClick={() => {
                  onSwitchMode('CHANGE_ICON');
                }}
                variant="text"
              >
                {t('Update icon')}
              </Button>
            )}
            {mode === 'CHANGE_ICON' && (
              <Button
                startIcon={<ChevronLeftIcon />}
                onClick={() => {
                  onSwitchMode('SETTINGS');
                }}
                variant="text"
              >
                {t('Settings')}
              </Button>
            )}
          </Stack>
        </Section>
      </Box>
      {mode === 'SETTINGS' && (
        <NodeSettings
          key={viewItem.id}
          node={viewItem}
          onModelItemUpdated={(updates) => {
            updateModelItem(viewItem.id, updates);
          }}
          onViewItemUpdated={(updates) => {
            updateViewItem(viewItem.id, updates);
          }}
          onDeleted={() => {
            uiStateActions.setItemControls(null);
            deleteViewItem(viewItem.id);
          }}
          onDuplicated={() => {
            // Create a duplicate of the model item first with a unique ID
            const newId = generateId();
            const newModelItem = {
              ...modelItem,
              id: newId
            };
            createModelItem(newModelItem);

            // Then create a duplicate of the view item with position in adjacent cell
            // Use the same ID as the model item to maintain the relationship
            const newViewItem = {
              ...viewItem,
              id: newId,
              tile: {
                x: viewItem.tile.x + 1,
                y: viewItem.tile.y
              }
            };
            createViewItem(newViewItem);
          }}
        />
      )}
      {mode === 'CHANGE_ICON' && (
        <Icons
          key={viewItem.id}
          iconCategories={iconCategories}
          onClick={(_icon) => {
            updateModelItem(viewItem.id, { icon: _icon.id });
          }}
        />
      )}
    </ControlsContainer>
  );
};
