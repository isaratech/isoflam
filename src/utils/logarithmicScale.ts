/**
 * Utility functions for logarithmic icon scaling
 * Provides high precision for small icon sizes and coarser control for larger sizes
 */

/**
 * Configuration for logarithmic scaling
 */
export const LOGARITHMIC_SCALE_CONFIG = {
    // Minimum scale factor (smallest icon size)
    MIN_SCALE: 0.1,
    // Maximum scale factor (largest icon size)
    MAX_SCALE: 50,
    // Base for logarithmic calculation
    LOG_BASE: Math.E,
    // Slider range (0-100 for better UX)
    SLIDER_MIN: 0,
    SLIDER_MAX: 100,
} as const;

/**
 * Converts a linear slider value (0-100) to a logarithmic scale factor
 * Provides high precision for small values and coarser control for large values
 *
 * @param sliderValue - Linear value from slider (0-100)
 * @returns Logarithmic scale factor (0.1-50)
 */
export function sliderToScaleFactor(sliderValue: number): number {
    const {MIN_SCALE, MAX_SCALE, SLIDER_MIN, SLIDER_MAX} = LOGARITHMIC_SCALE_CONFIG;

    // Normalize slider value to 0-1 range
    const normalizedValue = (sliderValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);

    // Apply logarithmic transformation
    // Using exponential function to create logarithmic feel
    // exp(x) grows slowly at first (high precision for small values)
    // then grows rapidly (coarser control for large values)
    const logValue = Math.exp(normalizedValue * Math.log(MAX_SCALE / MIN_SCALE)) * MIN_SCALE;

    // Clamp to valid range and round to reasonable precision
    return Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, logValue)) * 100) / 100;
}

/**
 * Converts a logarithmic scale factor to a linear slider value (0-100)
 *
 * @param scaleFactor - Logarithmic scale factor (0.1-50)
 * @returns Linear slider value (0-100)
 */
export function scaleFactorToSlider(scaleFactor: number): number {
    const {MIN_SCALE, MAX_SCALE, SLIDER_MIN, SLIDER_MAX} = LOGARITHMIC_SCALE_CONFIG;

    // Clamp scale factor to valid range
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleFactor));

    // Apply inverse logarithmic transformation
    const logValue = Math.log(clampedScale / MIN_SCALE) / Math.log(MAX_SCALE / MIN_SCALE);

    // Convert back to slider range
    const sliderValue = logValue * (SLIDER_MAX - SLIDER_MIN) + SLIDER_MIN;

    return Math.round(sliderValue);
}

/**
 * Gets appropriate step size for the current scale factor
 * Smaller steps for small values, larger steps for large values
 *
 * @param scaleFactor - Current scale factor
 * @returns Appropriate step size for text input
 */
export function getStepSize(scaleFactor: number): number {
    if (scaleFactor < 0.5) return 0.01;  // High precision for very small icons
    if (scaleFactor < 1) return 0.05;    // Medium precision for small icons
    if (scaleFactor < 2) return 0.1;     // Standard precision for normal icons
    if (scaleFactor < 5) return 0.25;    // Lower precision for large icons
    if (scaleFactor < 10) return 0.5;    // Coarse precision for large icons
    if (scaleFactor < 25) return 1;      // Coarser precision for very large icons
    return 2.5;                          // Very coarse precision for extremely large icons
}

/**
 * Formats scale factor for display in text input
 *
 * @param scaleFactor - Scale factor to format
 * @returns Formatted string with appropriate decimal places
 */
export function formatScaleFactor(scaleFactor: number): string {
    if (scaleFactor < 0.1) return scaleFactor.toFixed(2);
    if (scaleFactor < 1) return scaleFactor.toFixed(2);
    if (scaleFactor < 10) return scaleFactor.toFixed(1);
    return scaleFactor.toFixed(0);
}