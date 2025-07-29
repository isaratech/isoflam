import {useMemo, useState} from 'react';
import {useModelStore} from 'src/stores/modelStore';
import {Icon} from 'src/types';

export const useIconFiltering = () => {
  const [filter, setFilter] = useState<string>('');

  const icons = useModelStore((state) => {
    return state.icons;
  });

  const filteredIcons = useMemo(() => {
      if (filter === '' || !icons) return null;

    const regex = new RegExp(filter, 'gi');

    return icons.filter((icon: Icon) => {
      if (!filter) {
        return true;
      }

        return regex.test(icon.name) || regex.test(icon.id);
    });
  }, [icons, filter]);

  return {
    setFilter,
    filter,
    filteredIcons
  };
};
