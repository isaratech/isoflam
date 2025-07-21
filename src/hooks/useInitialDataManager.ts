import {useCallback, useRef, useState} from 'react';
import {IconCollectionState, InitialData} from 'src/types';
import {INITIAL_DATA, INITIAL_SCENE_STATE} from 'src/config';
import {categoriseIcons, CoordsUtils, generateId, getFitToViewParams, getItemByIdOrThrow} from 'src/utils';
import * as reducers from 'src/stores/reducers';
import {useModelStore} from 'src/stores/modelStore';
import {useView} from 'src/hooks/useView';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {modelSchema} from 'src/schemas/model';

export const useInitialDataManager = () => {
  const [isReady, setIsReady] = useState(false);
  const prevInitialData = useRef<InitialData>();
  const model = useModelStore((state) => {
    return state;
  });
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });
  const { changeView } = useView();

  const load = useCallback(
    (_initialData: InitialData) => {
      if (!_initialData || prevInitialData.current === _initialData) return;

      setIsReady(false);

        // Extract InitialData-specific properties before validation
        const {view: initialView, zoom: initialZoom, fitToView: initialFitToView, ...modelData} = _initialData;

        const validationResult = modelSchema.safeParse(modelData);

      if (!validationResult.success) {
        // TODO: let's get better at reporting error messages here (starting with how we present them to users)
        // - not in console but in a modal
        // Format detailed error messages for the user
        const errorMessages = validationResult.error.errors.map(
          (error, index) => {
            let message = `${index + 1}. ${error.message}`;
            if (error.path && error.path.length > 0) {
              message += ` (Path: ${error.path.join(' → ')})`;
            }
            return message;
          }
        );

        const detailedErrorMessage = `There ${
          validationResult.error.errors.length === 1
            ? 'is an error'
            : 'are errors'
        } in your model:\n\n${errorMessages.join('\n\n')}`;

        window.alert(detailedErrorMessage);
        return;
      }

        // Use the validated data from the schema (now includes default icons and colors)
        const initialData = validationResult.data;

      if (initialData.views.length === 0) {
        const updates = reducers.view({
          action: 'CREATE_VIEW',
          payload: {},
          ctx: {
            state: { model: initialData, scene: INITIAL_SCENE_STATE },
            viewId: generateId()
          }
        });

        Object.assign(initialData, updates.model);
      }

        // Reconstruct the full InitialData object for prevInitialData
        const fullInitialData = {...initialData, view: initialView, zoom: initialZoom, fitToView: initialFitToView};
        prevInitialData.current = fullInitialData;
      model.actions.set(initialData);

      const view = getItemByIdOrThrow(
        initialData.views,
          initialView ?? initialData.views[0].id
      );

      changeView(view.value.id, initialData);

        if (initialZoom !== undefined) {
            uiStateActions.setZoom(initialZoom);
        } else if (initialFitToView) {
        const rendererSize = rendererEl?.getBoundingClientRect();

        const { zoom, scroll } = getFitToViewParams(view.value, {
          width: rendererSize?.width ?? 0,
          height: rendererSize?.height ?? 0
        });

        uiStateActions.setScroll({
          position: scroll,
          offset: CoordsUtils.zero()
        });

        uiStateActions.setZoom(zoom);
      }

      const categoriesState: IconCollectionState[] = categoriseIcons(
          initialData.icons || []
      ).map((collection) => {
        return {
          id: collection.name,
          isExpanded: false
        };
      });

      uiStateActions.setIconCategoriesState(categoriesState);

      setIsReady(true);
    },
    [changeView, model.actions, rendererEl, uiStateActions]
  );

  const clear = useCallback(() => {
    load({ ...INITIAL_DATA, icons: model.icons, colors: model.colors });
    uiStateActions.resetUiState();
  }, [load, model.icons, model.colors, uiStateActions]);

  return {
    load,
    clear,
    isReady
  };
};
