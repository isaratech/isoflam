import { produce } from 'immer';
import { Volume } from 'src/types';
import { getItemByIdOrThrow } from 'src/utils';
import { State, ViewReducerContext } from './types';

export const updateVolume = (
  { id, ...updates }: { id: string } & Partial<Volume>,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);

  const newState = produce(state, (draft) => {
    const { volumes } = draft.model.views[view.index];

    if (!volumes) return;

    const volume = getItemByIdOrThrow(volumes, id);
    const newVolume = { ...volume.value, ...updates };
    volumes[volume.index] = newVolume;
  });

  return newState;
};

export const createVolume = (
  newVolume: Volume,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);

  const newState = produce(state, (draft) => {
    const { volumes } = draft.model.views[view.index];

    if (!volumes) {
      draft.model.views[view.index].volumes = [newVolume];
    } else {
      draft.model.views[view.index].volumes?.unshift(newVolume);
    }
  });

  return updateVolume(newVolume, {
    viewId,
    state: newState
  });
};

export const deleteVolume = (
  id: string,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);
  const volume = getItemByIdOrThrow(view.value.volumes ?? [], id);

  const newState = produce(state, (draft) => {
    draft.model.views[view.index].volumes?.splice(volume.index, 1);
  });

  return newState;
};