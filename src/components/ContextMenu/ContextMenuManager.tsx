import React, { useCallback } from 'react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { CoordsUtils, generateId } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { TEXTBOX_DEFAULTS } from 'src/config';
import { useImageHandler } from 'src/hooks/useImageHandler';
import { ConnectorMode, DrawRectangleMode } from 'src/types';
import { ContextMenu } from './ContextMenu';

export const ContextMenuManager = () => {
  const scene = useScene();
  const { t } = useTranslation();
  const { handleImageFile } = useImageHandler();
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

  // The drawing tools: the next drag on the canvas draws the shape
  const startDrawing = useCallback(
    (mode: DrawRectangleMode | ConnectorMode) => {
      uiStateActions.setMode(mode);
      onClose();
    },
    [uiStateActions, onClose]
  );

  const createNewImage = useCallback(() => {
    // Same import path as the toolbar and drag & drop (validation, size limit, selection).
    // The input is not attached to the page, so nothing is left behind if the user cancels.
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    const position = contextMenu?.tile || CoordsUtils.zero();

    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageFile(file, {
          position,
          style: 'NONE',
          size: { width: 5, height: 5 }
        });
      }
    };

    fileInput.click();

    onClose();
  }, [handleImageFile, contextMenu, onClose]);

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
          onClick: () => {
            startDrawing({
              type: 'RECTANGLE.DRAW',
              showCursor: true,
              id: null
            });
          }
        },
        {
          label: t('Create new volume'),
          onClick: () => {
            startDrawing({
              type: 'RECTANGLE.DRAW',
              showCursor: true,
              id: null,
              preset: 'VOLUME'
            });
          }
        },
        {
          label: t('Create new wall'),
          onClick: () => {
            startDrawing({
              type: 'CONNECTOR',
              showCursor: true,
              id: null,
              preset: 'WALL'
            });
          }
        },
        {
          label: t('Create new road'),
          onClick: () => {
            startDrawing({
              type: 'CONNECTOR',
              showCursor: true,
              id: null,
              preset: 'ROAD'
            });
          }
        },
        {
          label: t('Create new link'),
          onClick: () => {
            startDrawing({ type: 'CONNECTOR', showCursor: true, id: null });
          }
        },
        {
          label: t('Add image'),
          onClick: createNewImage
        }
      ];

  return (
    <ContextMenu
      onClose={onClose}
      position={contextMenu.position}
      menuItems={menuItems}
    />
  );
};
