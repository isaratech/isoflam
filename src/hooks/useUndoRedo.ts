import {useCallback, useEffect} from 'react';
import {useHistoryStore} from 'src/stores/historyStore';
import {useModelStore} from 'src/stores/modelStore';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useView} from 'src/hooks/useView';
import {ItemControls, Model, View} from 'src/types';
import {modelFromModelStore} from 'src/utils';

// Returns true if the controls still point to something that exists in the given view
const itemControlsTargetExists = (itemControls: ItemControls, view: View) => {
    const hasId = (id: string, items: { id: string }[] = []) => {
        return items.some((item) => {
            return item.id === id;
        });
    };

    switch (itemControls.type) {
        case 'ITEM':
            return hasId(itemControls.id, view.items);
        case 'CONNECTOR':
            return hasId(itemControls.id, view.connectors);
        case 'TEXTBOX':
            return hasId(itemControls.id, view.textBoxes);
        case 'RECTANGLE':
            return hasId(itemControls.id, view.rectangles);
        default:
            return true;
    }
};

export const useUndoRedo = () => {
    const historyActions = useHistoryStore((state) => state.actions);
    const canUndo = useHistoryStore((state) => state.actions.canUndo());
    const canRedo = useHistoryStore((state) => state.actions.canRedo());

    const modelActions = useModelStore((state) => state.actions);
    const currentModel = useModelStore((state) => modelFromModelStore(state));
    const uiStateActions = useUiStateStore((state) => state.actions);
    const currentViewId = useUiStateStore((state) => state.view);
    const itemControls = useUiStateStore((state) => state.itemControls);
    const {changeView} = useView();

    // Track model changes and push to history
    useEffect(() => {
        // The model has no view before the initial data is loaded: nothing worth restoring
        if (currentModel.views.length === 0) return;

        // Push current state to history when model changes
        // We use a small delay to avoid pushing every intermediate state during rapid changes
        const timeoutId = setTimeout(() => {
            historyActions.pushState(currentModel);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [currentModel, historyActions]);

    const restore = useCallback((model: Model) => {
        modelActions.set(model);

        // The restored model may come from another document (e.g. before "Clear canvas" or "Open"),
        // whose view ids differ from the current one.
        const view = model.views.find((v) => {
            return v.id === currentViewId;
        }) ?? model.views[0];

        // Re-sync the scene (connector paths, text box sizes) with the restored model
        changeView(view.id, model);

        if (itemControls && !itemControlsTargetExists(itemControls, view)) {
            uiStateActions.setItemControls(null);
        }

        uiStateActions.setHasUnsavedChanges(true);
    }, [modelActions, currentViewId, changeView, itemControls, uiStateActions]);

    const undo = useCallback(() => {
        const previousState = historyActions.undo();
        if (previousState) {
            restore(previousState);
        }
    }, [historyActions, restore]);

    const redo = useCallback(() => {
        const nextState = historyActions.redo();
        if (nextState) {
            restore(nextState);
        }
    }, [historyActions, restore]);

    const saveState = useCallback(() => {
        // Manually save current state to history (useful for explicit save points)
        historyActions.pushState(currentModel);
    }, [historyActions, currentModel]);

    const clearHistory = useCallback(() => {
        historyActions.clear();
    }, [historyActions]);

    return {
        undo,
        redo,
        canUndo,
        canRedo,
        saveState,
        clearHistory
    };
};
