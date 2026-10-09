import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Coords } from 'src/types';

interface MenuItemI {
  label: string;
  onClick: () => void;
}

interface Props {
  onClose: () => void;
  position: Coords;
  anchorEl?: HTMLElement;
  menuItems: MenuItemI[];
}

export const ContextMenu = ({
  onClose,
  position,
  anchorEl,
  menuItems
}: Props) => {
  return (
    <Menu
      open
      anchorReference="anchorPosition"
      anchorPosition={{
        left: position.x,
        top: position.y
      }}
      onClose={onClose}
    >
      {menuItems.map((item) => {
        return (
          <MenuItem key={item.label} onClick={item.onClick}>
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
