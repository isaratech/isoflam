import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { produce } from 'immer';
import { model } from 'src/fixtures/model';
import { HistoryProvider, useHistoryStore } from '../historyStore';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <HistoryProvider>{children}</HistoryProvider>;
};

describe('historyStore', () => {
  it('ignores a state identical to the present one', () => {
    const { result } = renderHook(
      () => {
        return useHistoryStore((state) => {
          return state;
        });
      },
      { wrapper }
    );

    act(() => {
      result.current.actions.pushState(model);
      // Same content, new wrapper object (as built by modelFromModelStore)
      result.current.actions.pushState({ ...model });
    });

    expect(result.current.past).toHaveLength(0);

    const updated = produce(model, (draft) => {
      draft.title = 'Updated';
    });

    act(() => {
      result.current.actions.pushState(updated);
    });

    expect(result.current.past).toEqual([model]);

    let restored;
    act(() => {
      restored = result.current.actions.undo();
    });

    expect(restored).toBe(model);
    expect(result.current.actions.canRedo()).toBe(true);
  });
});
