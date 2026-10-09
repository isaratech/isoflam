import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Slider
} from '@mui/material';
import { Rectangle } from 'src/types';
import { DEFAULTS_BUILDING } from 'src/config';
import { buildingRoofOptions } from 'src/utils';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { useTranslation } from 'src/hooks/useTranslation';
import type { TranslationKey } from 'src/hooks/useTranslation';
import { Section } from '../components/Section';

type Building = NonNullable<Rectangle['building']>;

interface Props {
  building: Building;
  onChange: (updates: Partial<Building>) => void;
}

const roofLabels: Record<(typeof buildingRoofOptions)[number], TranslationKey> =
  {
    FLAT: 'Flat roof',
    GABLE: 'Gable roof',
    HIP: 'Hip roof'
  };

export const BuildingControls = ({ building, onChange }: Props) => {
  const { t } = useTranslation();
  const settings = { ...DEFAULTS_BUILDING, ...building };

  return (
    <>
      <Section title={t('Roof')}>
        <Select
          value={settings.roof}
          onChange={(e) => {
            onChange({ roof: e.target.value as Building['roof'] });
          }}
        >
          {buildingRoofOptions.map((roof) => {
            return (
              <MenuItem key={roof} value={roof}>
                {t(roofLabels[roof])}
              </MenuItem>
            );
          })}
        </Select>
      </Section>
      {settings.roof !== 'FLAT' && (
        <Section title={t('Roof height')}>
          <Slider
            marks
            step={0.5}
            min={0.5}
            max={3}
            valueLabelDisplay="auto"
            value={settings.roofHeight}
            onChange={(e, roofHeight) => {
              onChange({ roofHeight: roofHeight as number });
            }}
          />
        </Section>
      )}
      <Section title={t('Roof colour')}>
        <ColorSelector
          onChange={(roofColor) => {
            onChange({ roofColor });
          }}
          activeColor={building.roofColor}
        />
      </Section>
      <Section title={t('Openings')}>
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.windows}
              onChange={(e) => {
                onChange({ windows: e.target.checked });
              }}
            />
          }
          label={t('Windows')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.door}
              onChange={(e) => {
                onChange({ door: e.target.checked });
              }}
            />
          }
          label={t('Door')}
        />
      </Section>
      {settings.door && (
        <Section title={t('Door facade')}>
          <Select
            value={settings.doorFacade}
            onChange={(e) => {
              onChange({
                doorFacade: e.target.value as Building['doorFacade']
              });
            }}
          >
            <MenuItem value="LEFT">{t('Left facade')}</MenuItem>
            <MenuItem value="RIGHT">{t('Right facade')}</MenuItem>
          </Select>
        </Section>
      )}
    </>
  );
};
