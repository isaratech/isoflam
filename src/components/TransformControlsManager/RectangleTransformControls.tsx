import React, { useCallback } from 'react';
import { useRectangle } from 'src/hooks/useRectangle';
import { AnchorPosition } from 'src/types';
import { convertBoundsToNamedAnchors, getBoundingBox } from 'src/utils';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { TransformControls } from './TransformControls';

const OPPOSITE_ANCHOR: { [key in AnchorPosition]: AnchorPosition } = {
  BOTTOM_LEFT: 'TOP_RIGHT',
  TOP_RIGHT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'TOP_LEFT',
  TOP_LEFT: 'BOTTOM_RIGHT'
};

interface Props {
  id: string;
}

export const RectangleTransformControls = ({ id }: Props) => {
  const rectangle = useRectangle(id);
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });

  const onAnchorMouseDown = useCallback(
    (key: AnchorPosition) => {
      const namedBounds = convertBoundsToNamedAnchors(
        getBoundingBox([rectangle.from, rectangle.to])
      );

      uiStateActions.setMode({
        type: 'RECTANGLE.TRANSFORM',
        id: rectangle.id,
        selectedAnchor: key,
        fixedCorner: namedBounds[OPPOSITE_ANCHOR[key]],
        showCursor: true
      });
    },
    [rectangle.id, rectangle.from, rectangle.to, uiStateActions]
  );

  return (
    <TransformControls
      from={rectangle.from}
      to={rectangle.to}
      onAnchorMouseDown={onAnchorMouseDown}
    />
  );
};
