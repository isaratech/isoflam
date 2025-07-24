import {ModeActions} from 'src/types';
import {setWindowCursor} from 'src/utils';

export const PlaceImage: ModeActions = {
    entry: () => {
        setWindowCursor('crosshair');
    },
    exit: () => {
        setWindowCursor('default');
    },
    mousemove: () => {
        // Empty mousemove handler to ensure cursor position updates during mouse movement
        // This allows the user to see which cell/tile they're hovering over
    },
    mousedown: ({uiState, isRendererInteraction}) => {
        if (uiState.mode.type !== 'PLACE_IMAGE' || !isRendererInteraction)
            return;

        // Store the selected position in a way that can be accessed by the file handler
        // We'll use a custom event to trigger the file dialog with the position
        const selectedPosition = uiState.mouse.position.tile;

        // Create a custom event with the position data
        const placeImageEvent = new CustomEvent('placeImageAtPosition', {
            detail: {position: selectedPosition}
        });

        // Dispatch the event to be handled by the ToolMenu component
        window.dispatchEvent(placeImageEvent);

        // Switch back to cursor mode
        uiState.actions.setMode({
            type: 'CURSOR',
            showCursor: true,
            mousedownItem: null
        });
    }
};