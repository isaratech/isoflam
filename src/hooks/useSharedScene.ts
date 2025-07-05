import { useEffect, useState } from 'react';
import { extractPasteKeyFromUrl, getSharedScene } from 'src/utils/pastebin';
import { useInitialDataManager } from './useInitialDataManager';
import { Scene } from 'src/types';

/**
 * Hook to check for a scene parameter in the URL and load the scene data if present
 * @returns An object with loading and error states
 */
export const useSharedScene = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialDataManager = useInitialDataManager();

  useEffect(() => {
    const loadSharedScene = async () => {
      // Check if there's a scene parameter in the URL
      const pasteKey = extractPasteKeyFromUrl(window.location.href);
      
      if (!pasteKey) {
        return; // No scene parameter, nothing to do
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the shared data from Pastebin
        const sharedData = await getSharedScene(pasteKey);
        
        if (!sharedData) {
          throw new Error('Failed to load shared scene');
        }
        
        // Get the current model data
        const currentData = initialDataManager.getCurrentData();
        
        if (!currentData) {
          throw new Error('Failed to get current data');
        }
        
        // Merge the shared data with the current model data
        // Keep current icons, colors, and other model properties, but use shared scene data
        const mergedData = {
          ...currentData,
          ...sharedData.model, // Apply any model data from the shared scene
          // Ensure we keep the current icons and colors if not provided in shared data
          icons: sharedData.model.icons || currentData.icons,
          colors: sharedData.model.colors || currentData.colors,
          // Apply the scene data
          connectors: sharedData.scene.connectors,
          textBoxes: sharedData.scene.textBoxes
        };
        
        // Load the merged data
        initialDataManager.load(mergedData);
        
        // Remove the scene parameter from the URL to prevent reloading on refresh
        const url = new URL(window.location.href);
        url.searchParams.delete('scene');
        window.history.replaceState({}, document.title, url.toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSharedScene();
  }, [initialDataManager]);
  
  return {
    isLoading,
    error
  };
};