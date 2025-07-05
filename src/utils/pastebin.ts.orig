import axios from 'axios';
import { Scene, SceneStore, ModelStore } from 'src/types';
import { modelFromModelStore } from 'src/utils';

// Pastebin API configuration
const PASTEBIN_API_URL = 'https://pastebin.com/api/api_post.php';
const PASTEBIN_RAW_URL = 'https://pastebin.com/raw/';

// Get the API key from environment variables or use a default for development
// In production, this should be set as an environment variable
const PASTEBIN_API_KEY = process.env.PASTEBIN_API_KEY || 'c7f8e25a9f0b9f9e9f8e9f8e9f8e9f8e';

// Validate that we have an API key
if (!PASTEBIN_API_KEY || PASTEBIN_API_KEY === 'c7f8e25a9f0b9f9e9f8e9f8e9f8e9f8e') {
  console.warn('Using default Pastebin API key. For production, set the PASTEBIN_API_KEY environment variable.');
}

/**
 * Interface for the response from the Pastebin API
 */
interface PastebinResponse {
  success: boolean;
  message?: string;
  pasteKey?: string;
}

/**
 * Interface for the shareable data structure
 */
interface ShareableData {
  model: Partial<ModelStore>;
  scene: Scene;
}

/**
 * Creates a new paste on Pastebin with the provided scene and model data
 * @param sceneData The scene data to share
 * @param modelData The model data to share
 * @returns A promise that resolves to the unique paste key
 * @throws Will not throw, but returns an error response if something goes wrong
 */
export const createSceneShare = async (
  sceneData: SceneStore,
  modelData?: ModelStore
): Promise<PastebinResponse> => {
  try {
    // Validate inputs
    if (!sceneData) {
      return {
        success: false,
        message: 'No scene data provided'
      };
    }

    // Validate API key
    if (!PASTEBIN_API_KEY) {
      return {
        success: false,
        message: 'Pastebin API key is not configured'
      };
    }

    // Extract only the necessary scene data (without the actions)
    const sceneToShare: Scene = {
      connectors: sceneData.connectors || {},
      textBoxes: sceneData.textBoxes || {}
    };

    // Create a shareable data structure with both scene and model data
    const dataToShare: ShareableData = {
      scene: sceneToShare,
      model: modelData ? modelFromModelStore(modelData) : {}
    };

    // Convert data to JSON string
    const jsonData = JSON.stringify(dataToShare);

    // Prepare form data for Pastebin API
    const formData = new FormData();
    formData.append('api_dev_key', PASTEBIN_API_KEY);
    formData.append('api_option', 'paste');
    formData.append('api_paste_code', jsonData);
    formData.append('api_paste_name', 'Isoflam Scene Share');
    formData.append('api_paste_format', 'json');
    formData.append('api_paste_private', '0'); // 0 = public, 1 = unlisted, 2 = private
    formData.append('api_paste_expire_date', '1W'); // Expire after 1 week

    // Send request to Pastebin API
    const response = await axios.post(PASTEBIN_API_URL, formData);

    // Check if the response contains a paste key (success) or an error message
    if (response.data && typeof response.data === 'string' && response.data.startsWith('https://pastebin.com/')) {
      // Extract the paste key from the URL
      const pasteKey = response.data.split('/').pop();
      return {
        success: true,
        pasteKey
      };
    }

    // Handle error response
    return {
      success: false,
      message: response.data || 'Unknown error occurred'
    };
  } catch (error) {
    console.error('Error sharing scene:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Retrieves shared data from Pastebin using the provided paste key
 * @param pasteKey The unique paste key
 * @returns A promise that resolves to the shared data or null if an error occurs
 * @throws Will not throw, but returns null if something goes wrong
 */
export const getSharedScene = async (
  pasteKey: string
): Promise<ShareableData | null> => {
  try {
    // Validate input
    if (!pasteKey) {
      console.error('Error retrieving shared scene: No paste key provided');
      return null;
    }

    // Get the raw paste content
    const response = await axios.get(`${PASTEBIN_RAW_URL}${pasteKey}`);
    
    // Validate response
    if (!response.data) {
      console.error('Error retrieving shared scene: Empty response from Pastebin');
      return null;
    }
    
    try {
      // Parse the JSON data
      const data = JSON.parse(response.data);
      
      // Validate parsed data
      if (!data) {
        console.error('Error retrieving shared scene: Invalid JSON data');
        return null;
      }
      
      // Handle both new format (ShareableData) and old format (just Scene)
      if (data.scene && data.model) {
        // New format with both scene and model data
        return {
          scene: {
            connectors: data.scene.connectors || {},
            textBoxes: data.scene.textBoxes || {}
          },
          model: data.model || {}
        };
      }
      
      // Old format with just scene data
      return {
        scene: {
          connectors: data.connectors || {},
          textBoxes: data.textBoxes || {}
        },
        model: {}
      };
    } catch (parseError) {
      console.error('Error parsing shared scene data:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving shared scene:', error);
    return null;
  }
};

/**
 * Generates a shareable URL for a scene
 * @param pasteKey The unique paste key
 * @returns The shareable URL
 */
export const getShareableUrl = (pasteKey: string): string => {
  // Create a URL with the paste key as a query parameter
  const url = new URL(window.location.href);
  url.searchParams.set('scene', pasteKey);
  return url.toString();
};

/**
 * Extracts the paste key from a URL
 * @param url The URL to extract the paste key from
 * @returns The paste key, or null if not found
 */
export const extractPasteKeyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('scene');
  } catch (error) {
    console.error('Error extracting paste key from URL:', error);
    return null;
  }
};