import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { ModelProvider, useModelStore } from 'src/stores/modelStore';
import { useIconFiltering } from '../useIconFiltering';

const icons = [
  { id: 'brancard_01', name: 'Brancard 01', url: '', scaleFactor: 1, colorizable: true },
  { id: 'brancard_02', name: 'Brancard 02', url: '', scaleFactor: 1, colorizable: true },
  { id: 'echelle', name: 'Échelle', url: '', scaleFactor: 1, colorizable: true }
];

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <ModelProvider>{children}</ModelProvider>;
};

const setup = () => {
  return renderHook(
    () => {
      const actions = useModelStore((state) => {
        return state.actions;
      });
      return { actions, ...useIconFiltering() };
    },
    { wrapper }
  );
};

describe('useIconFiltering', () => {
  it('returns every matching icon', () => {
    const { result } = setup();
    act(() => {
      result.current.actions.set({ icons });
      result.current.setFilter('brancard 0');
    });

    expect(result.current.filteredIcons?.map((icon) => icon.id)).toEqual([
      'brancard_01',
      'brancard_02'
    ]);
  });

  it('does not crash on regex special characters', () => {
    const { result } = setup();
    act(() => {
      result.current.actions.set({ icons });
      result.current.setFilter('(');
    });

    expect(result.current.filteredIcons).toEqual([]);
  });

  it('ignores case and accents', () => {
    const { result } = setup();
    act(() => {
      result.current.actions.set({ icons });
      result.current.setFilter('ECHELLE');
    });

    expect(result.current.filteredIcons?.map((icon) => icon.id)).toEqual([
      'echelle'
    ]);
  });
});
