import {
  getItemByIdOrThrow,
  getBoundingBox,
  convertBoundsToNamedAnchors,
  hasMovedTile
} from 'src/utils';
import { ModeActions } from 'src/types';

export const TransformVolume: ModeActions = {
  entry: () => {},
  exit: () => {},
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'VOLUME.TRANSFORM' ||
      !hasMovedTile(uiState.mouse)
    )
      return;

    if (uiState.mode.selectedAnchor) {
      // User is dragging an anchor
      const volume = getItemByIdOrThrow(
        scene.volumes,
        uiState.mode.id
      ).value;
      const volumeBounds = getBoundingBox([volume.to, volume.from]);
      const namedBounds = convertBoundsToNamedAnchors(volumeBounds);

      if (
        uiState.mode.selectedAnchor === 'BOTTOM_LEFT' ||
        uiState.mode.selectedAnchor === 'TOP_RIGHT'
      ) {
        const nextBounds = getBoundingBox([
          uiState.mode.selectedAnchor === 'BOTTOM_LEFT'
            ? namedBounds.TOP_RIGHT
            : namedBounds.BOTTOM_LEFT,
          uiState.mouse.position.tile
        ]);
        const nextNamedBounds = convertBoundsToNamedAnchors(nextBounds);

        scene.updateVolume(uiState.mode.id, {
          from: nextNamedBounds.TOP_RIGHT,
          to: nextNamedBounds.BOTTOM_LEFT
        });
      } else if (
        uiState.mode.selectedAnchor === 'BOTTOM_RIGHT' ||
        uiState.mode.selectedAnchor === 'TOP_LEFT'
      ) {
        const nextBounds = getBoundingBox([
          uiState.mode.selectedAnchor === 'BOTTOM_RIGHT'
            ? namedBounds.TOP_LEFT
            : namedBounds.BOTTOM_RIGHT,
          uiState.mouse.position.tile
        ]);
        const nextNamedBounds = convertBoundsToNamedAnchors(nextBounds);

        scene.updateVolume(uiState.mode.id, {
          from: nextNamedBounds.TOP_LEFT,
          to: nextNamedBounds.BOTTOM_RIGHT
        });
      }
    }
  },
  mousedown: () => {
    // MOUSE_DOWN is triggered by the anchor iteself (see `TransformAnchor.tsx`)
  },
  mouseup: ({ uiState }) => {
    if (uiState.mode.type !== 'VOLUME.TRANSFORM') return;

    uiState.actions.setMode({
      type: 'CURSOR',
      mousedownItem: null,
      showCursor: true
    });
  }
};