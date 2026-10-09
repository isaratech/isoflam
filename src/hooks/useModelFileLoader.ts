import { useCallback } from 'react';
import { useInitialDataManager } from 'src/hooks/useInitialDataManager';
import { useTranslation } from 'src/hooks/useTranslation';
import { useUiStateStore, useUiStateStoreApi } from 'src/stores/uiStateStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface LoadCallbacks {
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
}

// Loading a model from a JSON file (menu "Open" and drag & drop) and the confirmation
// needed before replacing the current drawing.
export const useModelFileLoader = () => {
  const { t } = useTranslation();
  const { load } = useInitialDataManager();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const uiStateStore = useUiStateStoreApi();

  // Returns false if the user wants to keep their unsaved changes
  const confirmDiscardChanges = useCallback(() => {
    if (!uiStateStore.getState().hasUnsavedChanges) return true;

    return window.confirm(t('Your unsaved changes will be lost. Continue?'));
  }, [uiStateStore, t]);

  const loadModelFile = useCallback(
    (file: File, { onLoadingStart, onLoadingEnd }: LoadCallbacks = {}) => {
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const proceed = window.confirm(
          t(
            'The JSON file is large ({size} MB). Loading it may take time and affect performance. Continue?'
          ).replace('{size}', fileSizeMB)
        );
        if (!proceed) return;
      }

      onLoadingStart?.();

      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        try {
          const modelData = JSON.parse(event.target?.result as string);

          if (!modelData || typeof modelData !== 'object') {
            throw new Error(t('The file does not contain valid data.'));
          }

          if (!modelData.title && !modelData.views && !modelData.items) {
            throw new Error(t('The file does not look like an Isoflam file.'));
          }

          if (load(modelData)) {
            uiStateActions.resetUiState();
            uiStateActions.setHasUnsavedChanges(false);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);

          let errorMessage = t('Error while loading the JSON file.');

          if (error instanceof SyntaxError) {
            errorMessage += ` ${t('The file contains invalid JSON.')}`;
          } else if (error instanceof Error) {
            errorMessage += ` ${error.message}`;
          }

          window.alert(errorMessage);
        } finally {
          onLoadingEnd?.();
        }
      };

      fileReader.onerror = () => {
        window.alert(t('Error while reading the file. It may be corrupted.'));
        onLoadingEnd?.();
      };

      fileReader.readAsText(file);
    },
    [load, uiStateActions, t]
  );

  return {
    confirmDiscardChanges,
    loadModelFile
  };
};
