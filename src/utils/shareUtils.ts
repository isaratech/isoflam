import LZString from 'lz-string';
import { Model } from 'src/types';

/**
 * Maximum URL length that most browsers support
 * We're being conservative to ensure compatibility
 */
export const MAX_URL_LENGTH = 2048;

/**
 * Compresses a model object into a URL-safe string
 * @param model The model to compress
 * @returns A URL-safe compressed string representation of the model
 */
export const compressModelToString = (model: Model): string => {
  const modelJson = JSON.stringify(model);
  return LZString.compressToEncodedURIComponent(modelJson);
};

/**
 * Decompresses a URL-safe string back into a model object
 * @param compressedString The compressed string to decompress
 * @returns The decompressed model object, or null if decompression fails
 */
export const decompressStringToModel = (
  compressedString: string
): Model | null => {
  try {
    const modelJson = LZString.decompressFromEncodedURIComponent(compressedString);
    if (!modelJson) {
      return null;
    }
    return JSON.parse(modelJson) as Model;
  } catch (error) {
    console.error('Failed to decompress model data:', error);
    return null;
  }
};

/**
 * Generates a shareable URL for the current model
 * @param model The model to share
 * @param baseUrl The base URL of the application
 * @returns A shareable URL, or null if the compressed data is too large
 */
export const generateShareableUrl = (
  model: Model,
  baseUrl: string = window.location.origin
): string | null => {
  const compressedData = compressModelToString(model);
  const url = `${baseUrl}?share=${compressedData}`;

  if (url.length > MAX_URL_LENGTH) {
    return null;
  }

  return url;
};

/**
 * Extracts and decompresses a model from a shareable URL
 * @param url The URL containing the compressed model data
 * @returns The decompressed model, or null if extraction fails
 */
export const extractModelFromUrl = (
  url: string = window.location.href
): Model | null => {
  try {
    const urlObj = new URL(url);
    const compressedData = urlObj.searchParams.get('share');

    if (!compressedData) {
      return null;
    }

    return decompressStringToModel(compressedData);
  } catch (error) {
    console.error('Failed to extract model from URL:', error);
    return null;
  }
};

/**
 * Checks if the current URL contains shared model data
 * @param url The URL to check
 * @returns True if the URL contains shared model data
 */
export const hasSharedModelInUrl = (
  url: string = window.location.href
): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.has('share');
  } catch {
    return false;
  }
};