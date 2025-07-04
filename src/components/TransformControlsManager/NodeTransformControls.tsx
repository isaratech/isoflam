import React, { useMemo } from 'react';
import { useViewItem } from 'src/hooks/useViewItem';
import { CoordsUtils } from 'src/utils';
import { TransformControls } from './TransformControls';

interface Props {
  id: string;
}

export const NodeTransformControls = ({ id }: Props) => {
  const node = useViewItem(id);

  const to = useMemo(() => {
    // If the node has a scale factor > 1, calculate the end tile based on the scale factor
    if (node.scaleFactor && node.scaleFactor > 1) {
      // Calculate the size of the icon in tiles based on scale factor
      // Round up to ensure we cover the full area
      const iconSize = Math.ceil(node.scaleFactor) - 1;

      return CoordsUtils.add(node.tile, {
        x: iconSize,
        y: iconSize
      });
    }

    // For non-scaled icons, use the same tile for both from and to
    return node.tile;
  }, [node.tile, node.scaleFactor]);

  return <TransformControls from={node.tile} to={to} />;
};
