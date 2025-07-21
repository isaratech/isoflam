import {useMemo} from 'react';
import {IconCollectionStateWithIcons} from 'src/types';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useModelStore} from 'src/stores/modelStore';

export const useIconCategories = () => {
  const icons = useModelStore((state) => {
    return state.icons;
  });
  const iconCategoriesState = useUiStateStore((state) => {
    return state.iconCategoriesState;
  });

  const iconCategories = useMemo<IconCollectionStateWithIcons[]>(() => {
    return iconCategoriesState.map((collection) => {
      // Get all icons for this collection
        const collectionIcons = (icons || []).filter((icon) => {
        return icon.collection === collection.id;
      });
      
      // Group icons by subcategory
        const subcategoriesMap = new Map<string, typeof collectionIcons>();
      
      // Find icons with subcategories
      collectionIcons.forEach((icon) => {
        if (icon.subcategory) {
          if (!subcategoriesMap.has(icon.subcategory)) {
            subcategoriesMap.set(icon.subcategory, []);
          }
          subcategoriesMap.get(icon.subcategory)?.push(icon);
        }
      });
      
      // Create subcategories array
      const subcategories = Array.from(subcategoriesMap.entries()).map(([id, subcategoryIcons]) => {
        // Find subcategory state or use default
        const subcategoryState = collection.subcategories?.find(s => s.id === id) || { id, isExpanded: false };
        
        return {
          ...subcategoryState,
          icons: subcategoryIcons
        };
      });
      
      // Get icons without subcategory
      const iconsWithoutSubcategory = collectionIcons.filter(icon => !icon.subcategory);
      
      return {
        ...collection,
        icons: iconsWithoutSubcategory,
        subcategories: subcategories.length > 0 ? subcategories : undefined
      };
    });
  }, [icons, iconCategoriesState]);

  return {
    iconCategories
  };
};
