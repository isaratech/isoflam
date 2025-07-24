import React, {useCallback, useEffect, useRef} from 'react';
import {Stack} from '@mui/material';
import {
    AddOutlined as AddIcon,
    CropSquareOutlined as CropSquareIcon,
    EastOutlined as ConnectorIcon,
    ImageOutlined as ImageIcon,
    NearMeOutlined as NearMeIcon,
    PanToolOutlined as PanToolIcon,
    Title as TitleIcon
} from '@mui/icons-material';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {IconButton} from 'src/components/IconButton/IconButton';
import {UiElement} from 'src/components/UiElement/UiElement';
import {useScene} from 'src/hooks/useScene';
import {TEXTBOX_DEFAULTS} from 'src/config';
import {generateId} from 'src/utils';
import {useTranslation} from 'src/hooks/useTranslation';
import {Coords} from 'src/types/common';

export const ToolMenu = () => {
  const { t } = useTranslation();
    const {createTextBox, createRectangle} = useScene();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedImagePositionRef = useRef<Coords | null>(null);
  const mode = useUiStateStore((state) => {
    return state.mode;
  });
  const uiStateStoreActions = useUiStateStore((state) => {
    return state.actions;
  });
  const mousePosition = useUiStateStore((state) => {
    return state.mouse.position.tile;
  });

  const createTextBoxProxy = useCallback(() => {
    const textBoxId = generateId();

    createTextBox({
      ...TEXTBOX_DEFAULTS,
      id: textBoxId,
      tile: mousePosition
    });

    uiStateStoreActions.setMode({
      type: 'TEXTBOX',
      showCursor: false,
      id: textBoxId
    });
  }, [uiStateStoreActions, createTextBox, mousePosition]);

    const handleImageImport = useCallback(() => {
        // Switch to PLACE_IMAGE mode to let user select position first
        uiStateStoreActions.setMode({
            type: 'PLACE_IMAGE',
            showCursor: true
        });
    }, [uiStateStoreActions]);

    // Event listener for position selection
    useEffect(() => {
        const handlePlaceImageAtPosition = (event: CustomEvent) => {
            const position = event.detail.position as Coords;
            selectedImagePositionRef.current = position;
            // Open file dialog after position is selected
            fileInputRef.current?.click();
        };

        window.addEventListener('placeImageAtPosition', handlePlaceImageAtPosition as EventListener);

        return () => {
            window.removeEventListener('placeImageAtPosition', handlePlaceImageAtPosition as EventListener);
        };
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's an image file
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner un fichier image valide.');
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            const imageData = e.target?.result as string;

            // Use the selected position or fall back to current mouse position
            const position = selectedImagePositionRef.current || mousePosition;

            // Clear the selected position after use
            selectedImagePositionRef.current = null;

            // Create a new image rectangle at the selected position
            const newRectangle = {
                id: `image-rect-${Date.now()}`,
                from: {x: position.x, y: position.y},
                to: {x: position.x + 5, y: position.y + 5},
                imageData,
                imageName: file.name,
                style: 'SOLID' as const,
                width: 2,
                radius: 0
            };

            createRectangle(newRectangle);

            // Switch to rectangle transform mode to allow immediate editing
            uiStateStoreActions.setMode({
                type: 'RECTANGLE.TRANSFORM',
                id: newRectangle.id,
                showCursor: false,
                selectedAnchor: null
            });

            uiStateStoreActions.setItemControls({
                type: 'RECTANGLE',
                id: newRectangle.id
            });
        };

        fileReader.readAsDataURL(file);

        // Reset the input value so the same file can be selected again
        event.target.value = '';
    }, [createRectangle, mousePosition, uiStateStoreActions]);

  return (
    <UiElement>
      <Stack direction="row">
        <IconButton
          name={t('Select')}
          Icon={<NearMeIcon />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'CURSOR',
              showCursor: true,
              mousedownItem: null
            });
          }}
          isActive={mode.type === 'CURSOR' || mode.type === 'DRAG_ITEMS'}
        />
        <IconButton
          name={t('Pan')}
          Icon={<PanToolIcon />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'PAN',
              showCursor: false
            });

            uiStateStoreActions.setItemControls(null);
          }}
          isActive={mode.type === 'PAN'}
        />
        <IconButton
          name={t('Add item')}
          Icon={<AddIcon />}
          onClick={() => {
            uiStateStoreActions.setItemControls({
              type: 'ADD_ITEM'
            });
            uiStateStoreActions.setMode({
              type: 'PLACE_ICON',
              showCursor: true,
              id: null
            });
          }}
          isActive={mode.type === 'PLACE_ICON'}
        />
        <IconButton
          name={t('Rectangle')}
          Icon={<CropSquareIcon />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'RECTANGLE.DRAW',
              showCursor: true,
              id: null
            });
          }}
          isActive={mode.type === 'RECTANGLE.DRAW'}
        />
        <IconButton
          name={t('Connector')}
          Icon={<ConnectorIcon />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'CONNECTOR',
              id: null,
              showCursor: true
            });
          }}
          isActive={mode.type === 'CONNECTOR'}
        />
        <IconButton
          name={t('Text')}
          Icon={<TitleIcon />}
          onClick={createTextBoxProxy}
          isActive={mode.type === 'TEXTBOX'}
        />
          <IconButton
              name={t('Import Image')}
              Icon={<ImageIcon/>}
              onClick={handleImageImport}
              isActive={mode.type === 'PLACE_IMAGE'}
          />
      </Stack>
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{display: 'none'}}
        />
    </UiElement>
  );
};
