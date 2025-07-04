import React, { useMemo, useEffect } from 'react';
import { useModelStore } from 'src/stores/modelStore';
import { getItemByIdOrThrow } from 'src/utils';
import { IsometricIcon } from 'src/components/SceneLayers/Nodes/Node/IconTypes/IsometricIcon';
import { NonIsometricIcon } from 'src/components/SceneLayers/Nodes/Node/IconTypes/NonIsometricIcon';
import { DEFAULT_ICON } from 'src/config';
import { useColor } from 'src/hooks/useColor';

export const useIcon = (
  id: string | undefined,
  scaleFactor?: number,
  colorId?: string
) => {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const icons = useModelStore((state) => {
    return state.icons;
  });
  const color = useColor(colorId);

  const icon = useMemo(() => {
    if (!id) return DEFAULT_ICON;

    return getItemByIdOrThrow(icons, id).value;
  }, [icons, id]);

  const colorizedIcon = useMemo(() => {
    if (!icon.colorizable || !colorId) {
      return icon;
    }

    // For colorizable icons, replace black color with the selected color
    const originalUrl = icon.url;
    if (originalUrl.startsWith('data:image/svg+xml;base64,')) {
      try {
        const base64Data = originalUrl.replace(
          'data:image/svg+xml;base64,',
          ''
        );
        const svgContent = atob(base64Data);

        // Replace black color (#000000 or black) with the selected color
        const colorizedSvg = svgContent
          .replace(/fill="#000000"/g, `fill="${color.value}"`)
          .replace(/fill="black"/g, `fill="${color.value}"`)
          .replace(/fill="#000"/g, `fill="${color.value}"`);

        const newBase64 = btoa(colorizedSvg);
        const newUrl = `data:image/svg+xml;base64,${newBase64}`;

        return {
          ...icon,
          url: newUrl
        };
      } catch (error) {
        console.warn('Failed to colorize icon:', error);
        return icon;
      }
    }

    return icon;
  }, [icon, colorId, color]);

  useEffect(() => {
    setHasLoaded(false);
  }, [icon.url]);

  const iconComponent = useMemo(() => {
    if (!colorizedIcon.isIsometric) {
      setHasLoaded(true);
      return (
        <NonIsometricIcon icon={colorizedIcon} scaleFactor={scaleFactor} />
      );
    }

    return (
      <IsometricIcon
        icon={colorizedIcon}
        scaleFactor={scaleFactor}
        onImageLoaded={() => {
          setHasLoaded(true);
        }}
      />
    );
  }, [colorizedIcon, scaleFactor]);

  return {
    icon,
    iconComponent,
    hasLoaded
  };
};
