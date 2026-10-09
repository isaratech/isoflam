import {useDeferredValue, useMemo, useState} from 'react';
import {useModelStore} from 'src/stores/modelStore';
import {Icon} from 'src/types';

// Lower case and strip accents so that "echelle" also finds "Échelle"
const normalize = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
};

export const useIconFiltering = () => {
  const [filter, setFilter] = useState<string>('');
  // Filtering and rendering many icons is expensive: keep typing responsive
  const deferredFilter = useDeferredValue(filter);

  const icons = useModelStore((state) => {
    return state.icons;
  });

  const filteredIcons = useMemo(() => {
    const query = normalize(deferredFilter.trim());

    if (query === '' || !icons) return null;

    return icons.filter((icon: Icon) => {
      return normalize(icon.name).includes(query) || normalize(icon.id).includes(query);
    });
  }, [icons, deferredFilter]);

  return {
    setFilter,
    filter,
    filteredIcons
  };
};
