import { useCallback } from 'react';
import { useScene } from 'src/hooks/useScene';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { Coords } from 'src/types/common';
import { useTranslation } from 'src/hooks/useTranslation';
import { downscaleImage } from 'src/utils';

export interface ImageRectangleOptions {
  position?: Coords;
  style?: 'SOLID' | 'NONE';
  size?: { width: number; height: number };
}

export interface ImageHandlerCallbacks {
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
  onError?: (error: string) => void;
}

export const useImageHandler = () => {
  const scene = useScene();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const { t } = useTranslation();

  const createImageRectangle = useCallback(
    (
      imageData: string,
      imageName: string,
      options: ImageRectangleOptions = {}
    ) => {
      const {
        position = { x: 5, y: 5 },
        style = 'SOLID',
        size = { width: 5, height: 5 }
      } = options;

      const newRectangle = {
        id: `image-rect-${Date.now()}`,
        from: { x: position.x, y: position.y },
        to: { x: position.x + size.width, y: position.y + size.height },
        imageData,
        imageName,
        style,
        width: 2,
        radius: 0
      };

      scene.createRectangle(newRectangle);

      // Back to the select tool: the image stays selected, with its resize handles. (The
      // transform mode without a selected anchor swallowed the next click.)
      uiStateActions.setMode({
        type: 'CURSOR',
        showCursor: true,
        mousedownItem: null
      });

      uiStateActions.setItemControls({
        type: 'RECTANGLE',
        id: newRectangle.id
      });

      return newRectangle;
    },
    [scene, uiStateActions]
  );

  const handleImageFile = useCallback(
    (
      file: File,
      options: ImageRectangleOptions = {},
      callbacks: ImageHandlerCallbacks = {}
    ) => {
      const { onLoadingStart, onLoadingEnd, onError } = callbacks;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMessage = t('Please select a valid image file.');
        onError?.(errorMessage);
        alert(errorMessage);
        return;
      }

      onLoadingStart?.();

      try {
        const fileReader = new FileReader();

        fileReader.onload = async (event) => {
          try {
            const imageData = await downscaleImage(
              event.target?.result as string,
              file.type
            );
            createImageRectangle(imageData, file.name, options);
          } catch (error) {
            console.error('Error processing image:', error);
            const errorMessage = t('Error while processing the image.');
            onError?.(errorMessage);
            alert(errorMessage);
          } finally {
            onLoadingEnd?.();
          }
        };

        fileReader.onerror = () => {
          const errorMessage = t('Error while reading the image file.');
          onError?.(errorMessage);
          alert(errorMessage);
          onLoadingEnd?.();
        };

        fileReader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading image file:', error);
        const errorMessage = t('Error while reading the image file.');
        onError?.(errorMessage);
        alert(errorMessage);
        onLoadingEnd?.();
      }
    },
    [createImageRectangle, t]
  );

  return {
    handleImageFile,
    createImageRectangle
  };
};
