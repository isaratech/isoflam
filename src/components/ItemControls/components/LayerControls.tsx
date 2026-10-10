import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  FlipToBack as SendToBackIcon,
  FlipToFront as BringToFrontIcon,
  KeyboardArrowDown as SendBackwardIcon,
  KeyboardArrowUp as BringForwardIcon
} from '@mui/icons-material';
import { ItemReference, LayerOrderingAction } from 'src/types';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import type { TranslationKey } from 'src/hooks/useTranslation';
import { Section } from './Section';

interface Props {
  item: ItemReference;
}

const actions: {
  action: LayerOrderingAction;
  label: TranslationKey;
  Icon: typeof SendToBackIcon;
}[] = [
  { action: 'BRING_TO_FRONT', label: 'Bring to front', Icon: BringToFrontIcon },
  { action: 'BRING_FORWARD', label: 'Bring forward', Icon: BringForwardIcon },
  { action: 'SEND_BACKWARD', label: 'Send backward', Icon: SendBackwardIcon },
  { action: 'SEND_TO_BACK', label: 'Send to back', Icon: SendToBackIcon }
];

// Bring forward / send backward buttons, for any kind of element
export const LayerControls = ({ item }: Props) => {
  const { t } = useTranslation();
  const { changeLayerOrder } = useScene();

  return (
    <Section title={t('Layer')}>
      <ToggleButtonGroup value={[]}>
        {actions.map(({ action, label, Icon }) => {
          return (
            <ToggleButton
              key={action}
              value={action}
              title={t(label)}
              aria-label={t(label)}
              onClick={() => {
                changeLayerOrder(action, item);
              }}
            >
              <Icon />
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Section>
  );
};
