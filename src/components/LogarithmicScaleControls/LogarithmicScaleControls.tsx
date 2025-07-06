import React from 'react';
import {
  BarChart as LogarithmicIcon,
  ShowChart as LinearIcon
} from '@mui/icons-material';
import { Stack, Box, Typography, Divider } from '@mui/material';
import { UiElement } from 'src/components/UiElement/UiElement';
import { IconButton } from 'src/components/IconButton/IconButton';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/hooks/useTranslation';

export const LogarithmicScaleControls = () => {
  const { t } = useTranslation();
  const uiStateStoreActions = useUiStateStore((state) => {
    return state.actions;
  });
  const isLogarithmicScale = useUiStateStore((state) => {
    return state.isLogarithmicScale;
  });

  return (
    <UiElement>
      <Stack direction="row">
        <IconButton
          name={t('Toggle logarithmic scale')}
          Icon={isLogarithmicScale ? <LogarithmicIcon /> : <LinearIcon />}
          onClick={uiStateStoreActions.toggleLogarithmicScale}
        />
        <Divider orientation="vertical" flexItem />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            px: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {isLogarithmicScale ? t('Logarithmic') : t('Linear')}
          </Typography>
        </Box>
      </Stack>
    </UiElement>
  );
};