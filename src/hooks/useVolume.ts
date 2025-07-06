import { useMemo } from 'react';
import { getItemByIdOrThrow } from 'src/utils';
import { useScene } from 'src/hooks/useScene';

export const useVolume = (id: string) => {
  const { volumes } = useScene();

  const volume = useMemo(() => {
    return getItemByIdOrThrow(volumes, id).value;
  }, [volumes, id]);

  return volume;
};