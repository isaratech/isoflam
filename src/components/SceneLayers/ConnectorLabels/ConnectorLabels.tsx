import React from 'react';
import { useScene } from 'src/hooks/useScene';
import { ConnectorLabel } from './ConnectorLabel';

interface Props {
  connectors: ReturnType<typeof useScene>['connectors'];
}

export const ConnectorLabels = ({ connectors }: Props) => {
  return (
    <>
      {connectors
        .filter((connector) => {
          // A connector without a computed path cannot be positioned
          return Boolean(connector.description) && Boolean(connector.path);
        })
        .map((connector) => {
          return <ConnectorLabel key={connector.id} connector={connector} />;
        })}
    </>
  );
};
