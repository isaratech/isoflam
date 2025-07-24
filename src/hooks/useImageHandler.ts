import {useCallback} from 'react';
import {useScene} from 'src/hooks/useScene';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {Coords} from 'src/types/common';

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
    const uiStateActions = useUiStateStore((state) => state.actions);

    const createImageRectangle = useCallback((
        imageData: string,
        imageName: string,
        options: ImageRectangleOptions = {}
    ) => {
        const {
            position = {x: 5, y: 5},
            style = 'SOLID',
            size = {width: 5, height: 5}
        } = options;

        const newRectangle = {
            id: `image-rect-${Date.now()}`,
            from: {x: position.x, y: position.y},
            to: {x: position.x + size.width, y: position.y + size.height},
            imageData,
            imageName,
            style,
            width: 2,
            radius: 0
        };

        scene.createRectangle(newRectangle);

        // Switch to rectangle transform mode to allow immediate editing
        uiStateActions.setMode({
            type: 'RECTANGLE.TRANSFORM',
            id: newRectangle.id,
            showCursor: false,
            selectedAnchor: null
        });

        uiStateActions.setItemControls({
            type: 'RECTANGLE',
            id: newRectangle.id
        });

        return newRectangle;
    }, [scene, uiStateActions]);

    const handleImageFile = useCallback((
        file: File,
        options: ImageRectangleOptions = {},
        callbacks: ImageHandlerCallbacks = {}
    ) => {
        const {onLoadingStart, onLoadingEnd, onError} = callbacks;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            const errorMessage = 'Veuillez sélectionner un fichier image valide.';
            onError?.(errorMessage);
            alert(errorMessage);
            return;
        }

        onLoadingStart?.();

        try {
            const fileReader = new FileReader();

            fileReader.onload = (event) => {
                try {
                    const imageData = event.target?.result as string;
                    createImageRectangle(imageData, file.name, options);
                } catch (error) {
                    console.error('Error processing image:', error);
                    const errorMessage = 'Erreur lors du traitement de l\'image.';
                    onError?.(errorMessage);
                    alert(errorMessage);
                } finally {
                    onLoadingEnd?.();
                }
            };

            fileReader.onerror = () => {
                const errorMessage = 'Erreur lors de la lecture du fichier image.';
                onError?.(errorMessage);
                alert(errorMessage);
                onLoadingEnd?.();
            };

            fileReader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading image file:', error);
            const errorMessage = 'Erreur lors de la lecture du fichier image.';
            onError?.(errorMessage);
            alert(errorMessage);
            onLoadingEnd?.();
        }
    }, [createImageRectangle]);

    return {
        handleImageFile,
        createImageRectangle
    };
};