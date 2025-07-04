/* eslint-disable import/no-extraneous-dependencies */
import { Colors, Icons, InitialData, Model } from 'src/types';
import { DEFAULT_COLOR } from 'src/config';
import { sdmisIcons } from '../fixtures/sdmisIcons';
import { icons as basicIcons } from '../fixtures/icons';
// Import export.json data
import exportData from '../assets/export.json';
import sitacIcons from "../fixtures/sitacIcons";

export const colors: Colors = [
  DEFAULT_COLOR,
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
  },
 {
    id: 'color8',
    value: '#ffffff'
  },
];

export const icons: Icons = [...basicIcons, ...sdmisIcons, ...sitacIcons];

// Simulate loading data from export.json
export const initialData: InitialData = {
  ...(exportData as Model),
  fitToView: true
};
