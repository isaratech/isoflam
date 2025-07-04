import React, { useCallback } from 'react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { getTilePosition, CoordsUtils } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
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

  if (!contextMenu) {
    return null;
  }

  return (
    <ContextMenu
      anchorEl={anchorEl}
      onClose={onClose}
      position={CoordsUtils.multiply(
        getTilePosition({ tile: contextMenu.tile }),
        zoom
      )}
      menuItems={[
        {
          label: t('Send backward'),
          onClick: () => {
            scene.changeLayerOrder('SEND_BACKWARD', contextMenu.item);
            onClose();
          }
        },
        {
          label: t('Bring forward'),
          onClick: () => {
            scene.changeLayerOrder('BRING_FORWARD', contextMenu.item);
            onClose();
          }
        },
        {
          label: t('Send to back'),
          onClick: () => {
            scene.changeLayerOrder('SEND_TO_BACK', contextMenu.item);
            onClose();
          }
        },
        {
          label: t('Bring to front'),
          onClick: () => {
            scene.changeLayerOrder('BRING_TO_FRONT', contextMenu.item);
            onClose();
          }
        }
      ]}
    />
  );
};
