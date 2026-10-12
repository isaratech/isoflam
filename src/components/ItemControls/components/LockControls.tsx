import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { useTranslation } from 'src/hooks/useTranslation';
import { Section } from './Section';

interface Props {
  locked?: boolean;
  onChange: (locked: boolean) => void;
}

// Locks any kind of element in place: it can't be dragged on the canvas any more
export const LockControls = ({ locked, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <Section>
      <FormControlLabel
        control={
          <Checkbox
            icon={<LockOpenIcon />}
            checkedIcon={<LockIcon />}
            checked={locked ?? false}
            onChange={(e) => {
              onChange(e.target.checked);
            }}
          />
        }
        label={t('Lock')}
      />
    </Section>
  );
};
