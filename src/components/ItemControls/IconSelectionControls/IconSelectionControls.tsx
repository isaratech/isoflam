import React, { useCallback } from 'react';
import { Stack, Alert, Typography } from '@mui/material';
import { ControlsContainer } from 'src/components/ItemControls/components/ControlsContainer';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { Icon } from 'src/types';
import { Section } from 'src/components/ItemControls/components/Section';
import { Searchbox } from 'src/components/ItemControls/IconSelectionControls/Searchbox';
import { useIconFiltering } from 'src/hooks/useIconFiltering';
import { useIconCategories } from 'src/hooks/useIconCategories';
import { useTranslation } from 'src/hooks/useTranslation';
import { Icons } from './Icons';
import { IconGrid } from './IconGrid';

export const IconSelectionControls = () => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const { setFilter, filteredIcons, filter } = useIconFiltering();
  const { iconCategories } = useIconCategories();

  const onMouseDown = useCallback(
    (icon: Icon) => {
      // Always switch to placing mode: the panel can stay open after another tool was picked
      uiStateActions.setMode({
        type: 'PLACE_ICON',
        showCursor: true,
        id: icon.id
      });
    },
    [uiStateActions]
  );

  return (
    <ControlsContainer
      header={
        <Section sx={{ position: 'sticky', top: 0, pt: 6, pb: 3 }}>
          <Stack spacing={2}>
            <Searchbox value={filter} onChange={setFilter} />
            <Alert severity="info">
              {t('You can drag and drop any item below onto the canvas.')}
            </Alert>
          </Stack>
        </Section>
      }
    >
      {filteredIcons && (
        <Section>
          {filteredIcons.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('No icons found')}
            </Typography>
          ) : (
            <IconGrid icons={filteredIcons} onMouseDown={onMouseDown} />
          )}
        </Section>
      )}
      {!filteredIcons && (
        <Icons iconCategories={iconCategories} onMouseDown={onMouseDown} />
      )}
    </ControlsContainer>
  );
};
