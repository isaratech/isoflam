import React, { useCallback } from 'react';
import { Coords } from 'src/types';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { CoordsUtils, generateId } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/hooks/useTranslation';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { PROJECTED_TILE_SIZE, TEXTBOX_DEFAULTS } from 'src/config';
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
  const scroll = useUiStateStore((state) => {
    return state.scroll;
  });
  const contextMenu = useUiStateStore((state) => {
    return state.contextMenu;
  });
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });
  const { size: rendererSize } = useResizeObserver(rendererEl);

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

  const createNewConnector = useCallback(() => {
    uiStateActions.setMode({
      type: 'CONNECTOR',
      id: null,
      showCursor: true
    });
    onClose();
  }, [uiStateActions, onClose]);

  const createNewImage = useCallback(() => {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileReader = new FileReader();

        fileReader.onload = (loadEvent) => {
          const imageData = loadEvent.target?.result as string;

          // Create a new image rectangle at the context menu position
          const newRectangle = {
            id: generateId(),
            from: contextMenu?.tile || CoordsUtils.zero(),
            to: CoordsUtils.add(contextMenu?.tile || CoordsUtils.zero(), {
              x: 5,
              y: 5
            }),
            imageData,
            imageName: file.name
          };

          scene.createRectangle(newRectangle);
        };

        fileReader.readAsDataURL(file);
      }

      // Clean up the file input
      document.body.removeChild(fileInput);
    };

    // Add to DOM and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();

    onClose();
  }, [scene, contextMenu, onClose]);

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
        },
        {
          label: t('Create new link'),
          onClick: createNewConnector
        },
        {
          label: t('Add image'),
          onClick: createNewImage
        }
      ];

  // Calculate position with zoom correctly applied
  const getZoomedTilePosition = (tile: Coords): Coords => {
    if (!rendererSize) {
      // Fallback to the old calculation if renderer size is not available
      const halfW = (PROJECTED_TILE_SIZE.width * zoom) / 2;
      const halfH = (PROJECTED_TILE_SIZE.height * zoom) / 2;
      return {
        x: halfW * tile.x - halfW * tile.y,
        y: -(halfH * tile.x + halfH * tile.y)
      };
    }

    // Calculate world position using the zoomed tile size
    const halfW = (PROJECTED_TILE_SIZE.width * zoom) / 2;
    const halfH = (PROJECTED_TILE_SIZE.height * zoom) / 2;
    const worldPosition = {
      x: halfW * tile.x - halfW * tile.y,
      y: -(halfH * tile.x + halfH * tile.y)
    };

    // Convert world position to screen position
    return {
      x: worldPosition.x + rendererSize.width * 0.5,
      y: worldPosition.y + rendererSize.height * 0.5
    };
  };

  return (
    <ContextMenu
      anchorEl={anchorEl}
      onClose={onClose}
      position={CoordsUtils.add(
        getZoomedTilePosition(contextMenu.tile),
        scroll.position
      )}
      menuItems={menuItems}
    />
  );
};