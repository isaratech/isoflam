import { Road } from 'src/types';
import { produce } from 'immer';
import { getItemByIdOrThrow, getConnectorPath, getAllRoadAnchors } from 'src/utils';
import { validateRoad } from 'src/schemas/validation';
import { State, ViewReducerContext } from './types';

export const deleteRoad = (
  id: string,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);
  const road = getItemByIdOrThrow(view.value.roads ?? [], id);

  const newState = produce(state, (draft) => {
    draft.model.views[view.index].roads?.splice(road.index, 1);
    delete draft.scene.roads[road.index];
  });

  return newState;
};

export const syncRoad = (
  id: string,
  { viewId, state }: ViewReducerContext
) => {
  const newState = produce(state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, viewId);
    const road = getItemByIdOrThrow(view.value.roads ?? [], id);
    const allAnchors = getAllRoadAnchors(view.value.roads ?? []);
    const issues = validateRoad(road.value, {
      view: view.value,
      model: state.model,
      allAnchors
    });

    if (issues.length > 0) {
      const stateAfterDelete = deleteRoad(id, { viewId, state: draft });

      draft.scene = stateAfterDelete.scene;
      draft.model = stateAfterDelete.model;
    } else {
      const path = getConnectorPath({
        anchors: road.value.anchors,
        view: view.value
      });

      draft.scene.roads[road.value.id] = { path };
    }
  });

  return newState;
};

export const updateRoad = (
  { id, ...updates }: { id: string } & Partial<Road>,
  { state, viewId }: ViewReducerContext
): State => {
  const newState = produce(state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, viewId);
    const { roads } = draft.model.views[view.index];

    if (!roads) return;

    const road = getItemByIdOrThrow(roads, id);
    const newRoad = { ...road.value, ...updates };
    roads[road.index] = newRoad;

    if (updates.anchors) {
      const stateAfterSync = syncRoad(newRoad.id, {
        viewId,
        state: draft
      });

      draft.model = stateAfterSync.model;
      draft.scene = stateAfterSync.scene;
    }
  });

  return newState;
};

export const createRoad = (
  newRoad: Road,
  { state, viewId }: ViewReducerContext
): State => {
  const newState = produce(state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, viewId);
    const { roads } = draft.model.views[view.index];

    if (!roads) {
      draft.model.views[view.index].roads = [newRoad];
    } else {
      draft.model.views[view.index].roads?.unshift(newRoad);
    }

    const stateAfterSync = syncRoad(newRoad.id, {
      viewId,
      state: draft
    });

    draft.model = stateAfterSync.model;
    draft.scene = stateAfterSync.scene;
  });

  return newState;
};