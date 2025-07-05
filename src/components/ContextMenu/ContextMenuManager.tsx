import React, { useCallback } from 'react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { getTilePosition, CoordsUtils, generateId } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { TEXTBOX_DEFAULTS } from 'src/config';
import { ContextMenu } from './ContextMenu';

interface Props {
  anchorEl?: HTMLElement;
}

export const ContextMenuManager = ({ anchorEl }: Props) => {
  const scene = useScene();
  const { t } = useTranslation();
  const zoom = useUiStateStore((state) => {
    return state.zoom;
  });
  const contextMenu = useUiStateStore((state) => {
    return state.contextMenu;
  });

  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });

  const onClose = useCallback(() => {
    uiStateActions.setContextMenu(null);
  }, [uiStateActions]);

  const createNewIcon = useCallback(() => {
    uiStateActions.setMode({
      type: 'PLACE_ICON',
      showCursor: true,
      id: null
    });
    uiStateActions.setItemControls({
      type: 'ADD_ITEM'
    });
    onClose();
  }, [uiStateActions, onClose]);

  const createNewText = useCallback(() => {
    const textBoxId = generateId();
    scene.createTextBox({
      ...TEXTBOX_DEFAULTS,
      id: textBoxId,
      tile: contextMenu?.tile || CoordsUtils.zero()
    });

    uiStateActions.setMode({
      type: 'TEXTBOX',
      showCursor: false,
      id: textBoxId
    });
    onClose();
  }, [uiStateActions, scene, contextMenu, onClose]);

  const createNewRectangle = useCallback(() => {
    uiStateActions.setMode({
      type: 'RECTANGLE.DRAW',
      showCursor: true,
      id: null
    });
    onClose();
  }, [uiStateActions, onClose]);

  if (!contextMenu) {
    return null;
  }

  // Determine which menu items to show based on whether we're right-clicking on an item or empty space
  const menuItems = contextMenu.item
    ? [
        {
          label: t('Send backward'),
          onClick: () => {
            scene.changeLayerOrder('SEND_BACKWARD', contextMenu.item!);
            onClose();
          }
        },
        {
          label: t('Bring forward'),
          onClick: () => {
            scene.changeLayerOrder('BRING_FORWARD', contextMenu.item!);
            onClose();
          }
        },
        {
          label: t('Send to back'),
          onClick: () => {
            scene.changeLayerOrder('SEND_TO_BACK', contextMenu.item!);
            onClose();
          }
        },
        {
          label: t('Bring to front'),
          onClick: () => {
            scene.changeLayerOrder('BRING_TO_FRONT', contextMenu.item!);
            onClose();
          }
        }
      ]
    : [
        {
          label: t('Create new icon'),
          onClick: createNewIcon
        },
        {
          label: t('Create new text'),
          onClick: createNewText
        },
        {
          label: t('Create new rectangle'),
          onClick: createNewRectangle
        }
      ];

  return (
    <ContextMenu
      anchorEl={anchorEl}
      onClose={onClose}
      position={CoordsUtils.multiply(
        getTilePosition({ tile: contextMenu.tile }),
        zoom
      )}
      menuItems={menuItems}
    />
  );
};
