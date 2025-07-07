import React from 'react';
import {ListItemIcon, MenuItem as MuiMenuItem} from '@mui/material';

export interface Props {
  onClick?: () => void;
  Icon?: React.ReactNode;
  children: string | React.ReactNode;
  selected?: boolean;
}

export const MenuItem = ({onClick, Icon, children, selected}: Props) => {
  return (
      <MuiMenuItem onClick={onClick} selected={selected}>
      <ListItemIcon>{Icon}</ListItemIcon>
      {children}
    </MuiMenuItem>
  );
};
