import {useCallback, useEffect} from 'react';
import {useHistoryStore} from 'src/stores/historyStore';
import {useModelStore} from 'src/stores/modelStore';
import {modelFromModelStore} from 'src/utils';

export const useUndoRedo = () => {
    const historyActions = useHistoryStore((state) => state.actions);
    const canUndo = useHistoryStore((state) => state.actions.canUndo());
    const canRedo = useHistoryStore((state) => state.actions.canRedo());

    const modelActions = useModelStore((state) => state.actions);
    const currentModel = useModelStore((state) => modelFromModelStore(state));

    // Track model changes and push to history
    useEffect(() => {
        // Push current state to history when model changes
        // We use a small delay to avoid pushing every intermediate state during rapid changes
        const timeoutId = setTimeout(() => {
            historyActions.pushState(currentModel);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [currentModel, historyActions]);

    const undo = useCallback(() => {
        const previousState = historyActions.undo();
        if (previousState) {
            // Restore the previous state to the model store
            modelActions.set(previousState);
        }
    }, [historyActions, modelActions]);

    const redo = useCallback(() => {
        const nextState = historyActions.redo();
        if (nextState) {
            // Restore the next state to the model store
            modelActions.set(nextState);
        }
    }, [historyActions, modelActions]);

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