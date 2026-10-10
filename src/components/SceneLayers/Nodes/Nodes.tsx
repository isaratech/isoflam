import React from 'react';
import { ViewItem } from 'src/types';
import { Node } from './Node/Node';

// Stacking order: by layer first, then nearer tiles above further ones
const getNodeOrder = (node: ViewItem) => {
  return (node.layer ?? 0) * 100000 - node.tile.x - node.tile.y;
};

interface Props {
  nodes: ViewItem[];
}

export const Nodes = ({ nodes }: Props) => {
  return (
    <>
      {[...nodes].reverse().map((node) => {
        return <Node key={node.id} order={getNodeOrder(node)} node={node} />;
      })}
    </>
  );
};
