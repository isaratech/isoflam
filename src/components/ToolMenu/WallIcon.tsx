import React from 'react';
import { createSvgIcon } from '@mui/material';

// An outlined brick wall: three courses of staggered bricks
export const WallIcon = createSvgIcon(
  <path
    fillRule="evenodd"
    d="M2 4h9v4H2zM3.5 5.5v1h6v-1zM13 4h9v4H13zM14.5 5.5v1h6v-1zM2 10h4v4H2zM3.5 11.5v1h1v-1zM8 10h8v4H8zM9.5 11.5v1h5v-1zM18 10h4v4H18zM19.5 11.5v1h1v-1zM2 16h9v4H2zM3.5 17.5v1h6v-1zM13 16h9v4H13zM14.5 17.5v1h6v-1z"
  />,
  'Wall'
);
