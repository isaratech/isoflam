import React, { createContext, useRef, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { ViewReducerParams } from './reducers/types';

// Define the history store type
export interface HistoryStore {
  past: ViewReducerParams[];
  future: ViewReducerParams[];
  recording: boolean;
  actions: {
    get: () => HistoryStore;
    set: (
      partial:
        | Partial<HistoryStore>
        | ((state: HistoryStore) => Partial<HistoryStore>),
      replace?: boolean
    ) => void;
    recordAction: (action: ViewReducerParams) => void;
    undo: () => ViewReducerParams | undefined;
    redo: () => ViewReducerParams | undefined;
    startRecording: () => void;
    stopRecording: () => void;
    clear: () => void;
  };
}

const initialState = () => {
  return createStore<HistoryStore>((set, get) => {
    return {
      past: [],
      future: [],
      recording: true,
      actions: {
        get,
        set,
        recordAction: (action: ViewReducerParams) => {
          if (!get().recording) return;
          set((state) => {
            return {
              past: [...state.past, action],
              future: [] // Clear future when a new action is recorded
            };
          });
        },
        undo: () => {
          const { past } = get();
          if (past.length === 0) return undefined;

          const newPast = [...past];
          const action = newPast.pop();

          set((state) => {
            return {
              past: newPast,
              future: [action!, ...state.future]
            };
          });

          return action;
        },
        redo: () => {
          const { future } = get();
          if (future.length === 0) return undefined;

          const newFuture = [...future];
          const action = newFuture.shift();

          set((state) => {
            return {
              past: [...state.past, action!],
              future: newFuture
            };
          });

          return action;
        },
        startRecording: () => {
          set({ recording: true });
        },
        stopRecording: () => {
          set({ recording: false });
        },
        clear: () => {
          set({ past: [], future: [] });
        }
      }
    };
  });
};

const HistoryContext = createContext<ReturnType<typeof initialState> | null>(
  null
);

interface ProviderProps {
  children: React.ReactNode;
}

export const HistoryProvider = ({ children }: ProviderProps) => {
  const storeRef = useRef<ReturnType<typeof initialState>>();

  if (!storeRef.current) {
    storeRef.current = initialState();
  }

  return (
    <HistoryContext.Provider value={storeRef.current}>
      {children}
    </HistoryContext.Provider>
  );
};

export function useHistoryStore<T>(
  selector: (state: HistoryStore) => T,
  equalityFn?: (left: T, right: T) => boolean
) {
  const store = useContext(HistoryContext);

  if (store === null) {
    throw new Error('Missing HistoryProvider in the tree');
  }

  const value = useStore(store, selector, equalityFn);

  return value;
}