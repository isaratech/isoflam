import { SupportedLanguage } from 'src/hooks/useTranslation';
import { Coords, EditorModeEnum, MainMenuOptions } from './common';
import { Icon } from './model';
import { ItemReference } from './scene';

interface AddItemControls {
  type: 'ADD_ITEM';
}

export type ItemControls = ItemReference | AddItemControls;

export interface Mouse {
  position: {
    screen: Coords;
    tile: Coords;
  };
  mousedown: {
    screen: Coords;
    tile: Coords;
    button?: number;
  } | null;
  delta: {
    screen: Coords;
    tile: Coords;
  } | null;
}

// Mode types
export interface InteractionsDisabled {
  type: 'INTERACTIONS_DISABLED';
  showCursor: boolean;
}

export interface CursorMode {
  type: 'CURSOR';
  showCursor: boolean;
  mousedownItem: ItemReference | null;
  // The pressed item was already selected: a click without drag selects the next item below
  mousedownItemWasSelected?: boolean;
}

export interface DragItemsMode {
  type: 'DRAG_ITEMS';
  showCursor: boolean;
  items: ItemReference[];
  isInitialMovement: Boolean;
}

export interface PanMode {
  type: 'PAN';
  showCursor: boolean;
  previousMode?: Mode;
  // True while a pan drag that started on the canvas is in progress
  isDragging?: boolean;
}

export interface PlaceIconMode {
  type: 'PLACE_ICON';
  showCursor: boolean;
  id: string | null;
}

export interface ConnectorMode {
  type: 'CONNECTOR';
  showCursor: boolean;
  id: string | null;
}

export interface DrawRectangleMode {
  type: 'RECTANGLE.DRAW';
  showCursor: boolean;
  id: string | null;
  // Draw a preset instead of a plain flat rectangle
  preset?: 'VOLUME' | 'WALL' | 'ROAD';
}

export const AnchorPositionOptions = {
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  TOP_RIGHT: 'TOP_RIGHT',
  TOP_LEFT: 'TOP_LEFT'
} as const;

export type AnchorPosition = keyof typeof AnchorPositionOptions;

export interface TransformRectangleMode {
  type: 'RECTANGLE.TRANSFORM';
  showCursor: boolean;
  id: string;
  selectedAnchor: AnchorPosition | null;
  // Corner opposite to the dragged anchor, fixed when the drag starts
  fixedCorner?: Coords;
}

export interface TextBoxMode {
  type: 'TEXTBOX';
  showCursor: boolean;
  id: string | null;
}

export interface PlaceImageMode {
  type: 'PLACE_IMAGE';
  showCursor: boolean;
}

export type Mode =
  | InteractionsDisabled
  | CursorMode
  | PanMode
  | PlaceIconMode
  | ConnectorMode
  | DrawRectangleMode
  | TransformRectangleMode
  | DragItemsMode
  | TextBoxMode
  | PlaceImageMode;
// End mode types

export interface Scroll {
  position: Coords;
  offset: Coords;
}

export interface IconSubcategoryState {
  id: string;
  isExpanded: boolean;
}

export interface IconCollectionState {
  id?: string;
  isExpanded: boolean;
  subcategories?: IconSubcategoryState[];
}

export type IconCollectionStateWithIcons = IconCollectionState & {
  icons: Icon[];
  subcategories?: (IconSubcategoryState & { icons: Icon[] })[];
};

export const DialogTypeEnum = {
  EXPORT_IMAGE: 'EXPORT_IMAGE',
  CREDITS: 'CREDITS'
} as const;

export interface ContextMenu {
  item?: ItemReference;
  tile: Coords;
  position: Coords;
}

export const LayerOrderingActionOptions = {
  BRING_TO_FRONT: 'BRING_TO_FRONT',
  SEND_TO_BACK: 'SEND_TO_BACK',
  BRING_FORWARD: 'BRING_FORWARD',
  SEND_BACKWARD: 'SEND_BACKWARD'
} as const;

export type LayerOrderingAction = keyof typeof LayerOrderingActionOptions;

export interface UiState {
  view: string;
  mainMenuOptions: MainMenuOptions;
  editorMode: keyof typeof EditorModeEnum;
  iconCategoriesState: IconCollectionState[];
  mode: Mode;
  dialog: keyof typeof DialogTypeEnum | null;
  isMainMenuOpen: boolean;
  itemControls: ItemControls | null;
  contextMenu: ContextMenu | null;
  zoom: number;
  scroll: Scroll;
  mouse: Mouse;
  rendererEl: HTMLDivElement | null;
  enableDebugTools: boolean;
  language: SupportedLanguage;
  hasUnsavedChanges: boolean;
}

export interface UiStateActions {
  setView: (view: string) => void;
  setMainMenuOptions: (options: MainMenuOptions) => void;
  setEditorMode: (mode: keyof typeof EditorModeEnum) => void;
  setIconCategoriesState: (iconCategoriesState: IconCollectionState[]) => void;
  resetUiState: () => void;
  setMode: (mode: Mode) => void;
  incrementZoom: () => void;
  decrementZoom: () => void;
  incrementZoomAtPosition: (
    screenPosition: { x: number; y: number },
    rendererSize: { width: number; height: number }
  ) => void;
  decrementZoomAtPosition: (
    screenPosition: { x: number; y: number },
    rendererSize: { width: number; height: number }
  ) => void;
  setIsMainMenuOpen: (isOpen: boolean) => void;
  setDialog: (dialog: keyof typeof DialogTypeEnum | null) => void;
  setZoom: (zoom: number) => void;
  setScroll: (scroll: Scroll) => void;
  setItemControls: (itemControls: ItemControls | null) => void;
  setContextMenu: (contextMenu: ContextMenu | null) => void;
  setMouse: (mouse: Mouse) => void;
  setRendererEl: (el: HTMLDivElement) => void;
  setEnableDebugTools: (enabled: boolean) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
}

export type UiStateStore = UiState & {
  actions: UiStateActions;
};
