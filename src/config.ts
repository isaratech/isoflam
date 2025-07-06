import {
  Size,
  InitialData,
  MainMenuOptions,
  Icon,
  Connector,
  TextBox,
  ViewItem,
  View,
  Rectangle,
  Volume,
  Colors
} from 'src/types';
import { CoordsUtils } from 'src/utils';

// =============================================================================
// TILE AND GRID CONFIGURATION
// =============================================================================

/**
 * Base size of a tile before isometric projection is applied.
 * This represents the logical size of a tile in the grid system.
 */
export const TILE_UNPROJECTED_SIZE = 100;

/**
 * Multipliers used to transform unprojected tiles into isometric projection.
 * These values create the characteristic diamond shape of isometric tiles.
 */
export const TILE_PROJECTION_MULTIPLIERS: Size = {
  width: 1.415,
  height: 0.819
};

/**
 * Final size of tiles after isometric projection is applied.
 * Calculated from the unprojected size and projection multipliers.
 */
export const TILE_PROJECTED_SIZE = {
  width: TILE_UNPROJECTED_SIZE * TILE_PROJECTION_MULTIPLIERS.width,
  height: TILE_UNPROJECTED_SIZE * TILE_PROJECTION_MULTIPLIERS.height
};

// =============================================================================
// DEFAULT VALUES AND STYLING
// =============================================================================

/**
 * Default color configuration used throughout the application.
 * Serves as fallback when no specific color is defined.
 */
export const DEFAULT_COLOR: Colors[0] = {
  id: '__DEFAULT__',
  value: '#000000'
};

/**
 * Default font family stack for text rendering.
 * Prioritizes Roboto, falls back to Arial, then system sans-serif.
 */
export const DEFAULT_FONT_FAMILY = 'Roboto, Arial, sans-serif';

/**
 * Default icon configuration used when no specific icon is provided.
 * Represents a basic isometric block element.
 */
export const DEFAULT_ICON: Icon = {
  id: 'default',
  name: 'block',
  isIsometric: true,
  url: '',
  scaleFactor: 1,
  colorizable: false
};

/**
 * Default height for item labels in the isometric view.
 * Measured in pixels.
 */
export const DEFAULT_LABEL_HEIGHT = 30;

// =============================================================================
// COMPONENT DEFAULT CONFIGURATIONS
// =============================================================================

/**
 * Default configuration for new views.
 * Provides initial empty state with required properties.
 */
export const DEFAULTS_VIEW: Required<
  Omit<View, 'id' | 'description' | 'lastUpdated'>
> = {
  name: 'Untitled view',
  items: [],
  connectors: [],
  rectangles: [],
  volumes: [],
  textBoxes: []
};

/**
 * Default configuration for view items (nodes in the scene).
 * Defines standard label height and scale factor.
 */
export const DEFAULTS_VIEW_ITEM: Required<Omit<ViewItem, 'id' | 'tile'>> = {
  labelHeight: 80,
  scaleFactor: 1,
  color: DEFAULT_COLOR.id,
  mirrorHorizontal: false,
  mirrorVertical: false
};

/**
 * Default configuration for connectors (lines between nodes).
 * Includes styling, width, and visual properties.
 */
export const DEFAULTS_CONNECTOR: Required<Omit<Connector, 'id' | 'color'>> = {
  width: 10,
  description: '',
  anchors: [],
  style: 'SOLID',
  showTriangle: true
};

/**
 * Default configuration for text boxes in the scene.
 * Defines orientation, font size, and default content.
 */
export const DEFAULTS_TEXTBOX: Required<
  Omit<TextBox, 'id' | 'tile' | 'color'>
> = {
  orientation: 'X',
  fontSize: 0.6,
  content: 'Text'
};

/**
 * Default configuration for rectangles (area selections).
 * Defines default line style.
 */
export const DEFAULTS_RECTANGLE: Required<
  Omit<Rectangle, 'id' | 'from' | 'to' | 'color'>
> = {
  style: 'NONE',
  width: 1,
  radius: 22
};

/**
 * Default configuration for volumes (3D area selections).
 * Defines default line style, height, and roof settings.
 */
export const DEFAULTS_VOLUME: Required<
  Omit<Volume, 'id' | 'from' | 'to' | 'color'>
> = {
  style: 'NONE',
  width: 1,
  radius: 22,
  height: 1,
  hasRoof: true
};

/**
 * Default configuration for volumes (3D area selections).
 * Defines default line style, height, and roof settings.
 */
export const DEFAULTS_VOLUME: Required<
  Omit<Volume, 'id' | 'from' | 'to' | 'color'>
> = {
  style: 'NONE',
  width: 1,
  radius: 22,
  height: 1,
  hasRoof: true
};

// =============================================================================
// CONNECTOR SPECIFIC CONFIGURATION
// =============================================================================

/**
 * Search offset used by the pathfinding algorithm for connectors.
 * Defines the boundaries of the search area around two connected nodes.
 * The grid encompasses the two nodes plus this offset.
 */
export const CONNECTOR_SEARCH_OFFSET = { x: 1, y: 1 };

// =============================================================================
// TEXTBOX SPECIFIC CONFIGURATION
// =============================================================================

/**
 * Padding applied around text content within text boxes.
 * Measured as a fraction of the text box size.
 */
export const TEXTBOX_PADDING = 0.2;

/**
 * Font weight applied to text within text boxes.
 * Uses CSS font-weight values.
 */
export const TEXTBOX_FONT_WEIGHT = 'bold';

// =============================================================================
// UI AND INTERACTION CONFIGURATION
// =============================================================================

/**
 * Amount by which zoom level changes with each zoom operation.
 * Used for zoom in/out functionality.
 */
export const UI_ZOOM_INCREMENT = 0.2;

/**
 * Minimum allowed zoom level.
 * Prevents zooming out beyond usable scale.
 */
export const UI_MIN_ZOOM = 0.2;

/**
 * Maximum allowed zoom level.
 * Prevents zooming in beyond practical scale.
 */
export const UI_MAX_ZOOM = 1;

/**
 * Size of transform anchor points in pixels.
 * Used for resize and transform controls on selected elements.
 */
export const UI_TRANSFORM_ANCHOR_SIZE = 30;

/**
 * Color used for transform controls and selection indicators.
 * Hex color value for visual consistency.
 */
export const UI_TRANSFORM_CONTROLS_COLOR = '#0392ff';

// =============================================================================
// INITIAL STATE CONFIGURATIONS
// =============================================================================

/**
 * Initial data structure for new projects.
 * Provides empty state with default color configuration.
 */
export const INITIAL_DATA: InitialData = {
  title: 'SITAC',
  version: '',
  icons: [],
  colors: [DEFAULT_COLOR],
  items: [],
  views: [],
  fitToView: false
};

/**
 * Initial UI state for the application interface.
 * Defines default zoom level and scroll position.
 */
export const INITIAL_UI_STATE = {
  zoom: 1,
  scroll: {
    position: CoordsUtils.zero(),
    offset: CoordsUtils.zero()
  }
};

/**
 * Initial scene state for 3D rendering context.
 * Provides empty collections for scene elements.
 */
export const INITIAL_SCENE_STATE = {
  connectors: {},
  textBoxes: {}
};

// =============================================================================
// MENU AND INTERFACE CONFIGURATION
// =============================================================================

/**
 * Configuration for main menu options.
 * Defines available actions in the primary application menu.
 */
export const MENU_MAIN_OPTIONS: MainMenuOptions = [
  'ACTION.OPEN',
  'EXPORT.JSON',
  'EXPORT.PNG',
  'ACTION.CLEAR_CANVAS',
  'LINK.GITHUB',
  'LINK.CREDITS',
  'VERSION'
];

// =============================================================================
// PROJECT AND EXPORT CONFIGURATION
// =============================================================================

/**
 * Padding applied around the project bounding box.
 * Used when calculating export boundaries and view fitting.
 */
export const PROJECT_BOUNDING_BOX_PADDING = 3;

/**
 * Empty value representation for markdown content.
 * Used as placeholder when markdown fields are empty.
 */
export const PROJECT_MARKDOWN_EMPTY_VALUE = '<p><br></p>';

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================
// These exports maintain compatibility with existing code that uses the old constant names.
// They reference the new prefixed constants defined above.

/** @deprecated Use TILE_UNPROJECTED_SIZE instead */
export const UNPROJECTED_TILE_SIZE = TILE_UNPROJECTED_SIZE;

/** @deprecated Use TILE_PROJECTED_SIZE instead */
export const PROJECTED_TILE_SIZE = TILE_PROJECTED_SIZE;

/** @deprecated Use DEFAULTS_VIEW instead */
export const VIEW_DEFAULTS = DEFAULTS_VIEW;

/** @deprecated Use DEFAULTS_VIEW_ITEM instead */
export const VIEW_ITEM_DEFAULTS = DEFAULTS_VIEW_ITEM;

/** @deprecated Use DEFAULTS_CONNECTOR instead */
export const CONNECTOR_DEFAULTS = DEFAULTS_CONNECTOR;

/** @deprecated Use DEFAULTS_TEXTBOX instead */
export const TEXTBOX_DEFAULTS = DEFAULTS_TEXTBOX;

/** @deprecated Use DEFAULTS_RECTANGLE instead */
export const RECTANGLE_DEFAULTS = DEFAULTS_RECTANGLE;

/** @deprecated Use UI_ZOOM_INCREMENT instead */
export const ZOOM_INCREMENT = UI_ZOOM_INCREMENT;

/** @deprecated Use UI_MIN_ZOOM instead */
export const MIN_ZOOM = UI_MIN_ZOOM;

/** @deprecated Use UI_MAX_ZOOM instead */
export const MAX_ZOOM = UI_MAX_ZOOM;

/** @deprecated Use UI_TRANSFORM_ANCHOR_SIZE instead */
export const TRANSFORM_ANCHOR_SIZE = UI_TRANSFORM_ANCHOR_SIZE;

/** @deprecated Use UI_TRANSFORM_CONTROLS_COLOR instead */
export const TRANSFORM_CONTROLS_COLOR = UI_TRANSFORM_CONTROLS_COLOR;

/** @deprecated Use MENU_MAIN_OPTIONS instead */
export const MAIN_MENU_OPTIONS = MENU_MAIN_OPTIONS;

/** @deprecated Use PROJECT_MARKDOWN_EMPTY_VALUE instead */
export const MARKDOWN_EMPTY_VALUE = PROJECT_MARKDOWN_EMPTY_VALUE;
