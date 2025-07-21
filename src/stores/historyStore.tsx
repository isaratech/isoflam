import React, {createContext, useContext, useRef} from 'react';
import {createStore, useStore} from 'zustand';
import {Model} from 'src/types';

interface HistoryState {
    past: Model[];
    present: Model | null;
    future: Model[];
}

interface HistoryStore extends HistoryState {
    actions: {
        pushState: (state: Model) => void;
        undo: () => Model | null;
        redo: () => Model | null;
        canUndo: () => boolean;
        canRedo: () => boolean;
        clear: () => void;
    };
}

const MAX_HISTORY_SIZE = 50;

const initialState = () => {
    return createStore<HistoryStore>((set, get) => {
        return {
            past: [],
            present: null,
            future: [],
            actions: {
                pushState: (state: Model) => {
                    const {past, present} = get();

                    // Don't add if the state is the same as current
                    if (present && JSON.stringify(present) === JSON.stringify(state)) {
                        return;
                    }

                    const newPast = present ? [...past, present] : past;

                    // Limit history size
                    const limitedPast = newPast.length > MAX_HISTORY_SIZE
                        ? newPast.slice(-MAX_HISTORY_SIZE)
                        : newPast;

                    set({
                        past: limitedPast,
                        present: state,
                        future: [] // Clear future when new state is pushed
                    });
                },

                undo: () => {
                    const {past, present, future} = get();

                    if (past.length === 0) {
                        return null;
                    }

                    const previous = past[past.length - 1];
                    const newPast = past.slice(0, past.length - 1);
                    const newFuture = present ? [present, ...future] : future;

                    set({
                        past: newPast,
                        present: previous,
                        future: newFuture
                    });

                    return previous;
                },

                redo: () => {
                    const {past, present, future} = get();

                    if (future.length === 0) {
                        return null;
                    }

                    const next = future[0];
                    const newFuture = future.slice(1);
                    const newPast = present ? [...past, present] : past;

                    set({
                        past: newPast,
                        present: next,
                        future: newFuture
                    });

                    return next;
                },

                canUndo: () => {
                    const {past} = get();
                    return past.length > 0;
                },

                canRedo: () => {
                    const {future} = get();
                    return future.length > 0;
                },

                clear: () => {
                    set({
                        past: [],
                        present: null,
                        future: []
                    });
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

export const HistoryProvider = ({children}: ProviderProps) => {
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