/**
 * Utility functions for logarithmic scaling
 */

/**
 * Applies logarithmic scaling to a zoom value if logarithmic scaling is enabled
 * @param zoom The current zoom value
 * @param isLogarithmicScale Whether logarithmic scaling is enabled
 * @returns The scaled zoom value
 */
export const applyLogarithmicScale = (
  zoom: number,
  isLogarithmicScale: boolean
): number => {
  if (!isLogarithmicScale) {
    return zoom;
  }

  // Apply logarithmic scaling
  // Using natural logarithm (base e) with an offset to ensure positive values
  // The formula is designed to maintain zoom=1 as the neutral point
  const base = Math.E;
  const offset = 1; // Ensures ln(offset + zoom) is positive for zoom > 0

  // Scale factor to adjust the intensity of the logarithmic effect
  const scaleFactor = 0.5;

  // Apply logarithmic transformation
  return 1 + (scaleFactor * Math.log(offset + zoom - 1)) / Math.log(base);
};

/**
 * Applies inverse logarithmic scaling to convert a logarithmically scaled value back to linear
 * @param scaledZoom The logarithmically scaled zoom value
 * @param isLogarithmicScale Whether logarithmic scaling is enabled
 * @returns The original zoom value
 */
export const applyInverseLogarithmicScale = (
  scaledZoom: number,
  isLogarithmicScale: boolean
): number => {
  if (!isLogarithmicScale) {
    return scaledZoom;
  }

  // Apply inverse logarithmic scaling
  // This is the inverse of the applyLogarithmicScale function
  const base = Math.E;
  const offset = 1;
  const scaleFactor = 0.5;

  // Apply inverse logarithmic transformation
  return 1 + base ** ((scaledZoom - 1) / scaleFactor) - offset;
};