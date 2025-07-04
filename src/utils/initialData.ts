/* eslint-disable import/no-extraneous-dependencies */
import { Colors, Icons, InitialData } from 'src/Isoflam';
import { sdmisIcons } from '../fixtures/sdmisIcons';
import { icons as basicIcons } from '../fixtures/icons';
import { DEFAULT_COLOR } from 'src/config';

export const colors: Colors = [
  {
    id: '__DEFAULT__',
    value: '#000000'
  },
  {
    id: 'color0',
    value: '#979797'
  },
  {
    id: 'color1',
    value: '#a5b8f3'
  },
  {
    id: 'color2',
    value: '#bbadfb'
  },
  {
    id: 'color3',
    value: '#f4eb8e'
  },
  {
    id: 'color4',
    value: '#f0aca9'
  },
  {
    id: 'color5',
    value: '#fad6ac'
  },
  {
    id: 'color6',
    value: '#a8dc9d'
  },
  {
    id: 'color7',
    value: '#b3e5e3'
  }
];

export const icons: Icons = [...basicIcons, ...sdmisIcons];

export const initialData: InitialData = {
  title: 'SITAC',
  version: '',
  icons: [],
  colors: [DEFAULT_COLOR],
  items: [],
  views: [],
  fitToView: false
};
