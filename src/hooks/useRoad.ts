import { useMemo } from 'react';
import { getItemByIdOrThrow } from 'src/utils';
import { useScene } from 'src/hooks/useScene';

export const useRoad = (id: string) => {
  const { roads } = useScene();

  const road = useMemo(() => {
    return getItemByIdOrThrow(roads, id).value;
  }, [roads, id]);

  return road;
};