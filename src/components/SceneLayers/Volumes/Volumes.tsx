import React from 'react';
import {useScene} from 'src/hooks/useScene';
import {Volume} from './Volume';

interface Props {
  volumes: ReturnType<typeof useScene>['volumes'];
}

export const Volumes = ({ volumes }: Props) => {
  return (
    <>
      {[...volumes].reverse().map((volume) => (
        <Volume key={volume.id} {...volume} />
      ))}
    </>
  );
};