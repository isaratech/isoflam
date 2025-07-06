import React from 'react';
import { useScene } from 'src/hooks/useScene';
import { Volume } from './Volume';

export const Volumes = () => {
  const { volumes } = useScene();

  return (
    <>
      {volumes.map((volume) => (
        <Volume key={volume.id} {...volume} />
      ))}
    </>
  );
};