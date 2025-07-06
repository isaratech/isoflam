import { useEffect, useRef } from 'react';
import { generateId } from 'src/utils';
import {
  ItemControls,
  UiStateActions,
  ViewItem,
  Connector,
  TextBox,
  Rectangle
} from 'src/types';
import { EditorModeEnum } from 'src/types/common';
import { TEXTBOX_DEFAULTS } from 'src/config';

// Define the scene interface based on how it's used
export interface Scene {
  items: ViewItem[];
  connectors: Connector[];
  textBoxes: TextBox[];
  rectangles: Rectangle[];
  deleteViewItem: (id: string) => void;
  deleteConnector: (id: string) => void;
  deleteTextBox: (id: string) => void;
  deleteRectangle: (id: string) => void;
  createViewItem: (item: ViewItem) => void;
  createConnector: (connector: Connector) => void;
  createTextBox: (textBox: TextBox) => void;
  createRectangle: (rectangle: Rectangle) => void;
  applyAction: (action: any) => void;
}

// Define the history actions interface
export interface HistoryActions {
  undo: () => any;
  redo: () => any;
}

export interface ShortcutHandlerProps {
  editorMode: keyof typeof EditorModeEnum;
  itemControls: ItemControls | null;
  scene: Scene;
  uiStateActions: Pick<UiStateActions, 'setMode' | 'setItemControls'>;
  historyActions: HistoryActions;
  copiedItemRef: React.MutableRefObject<any>;
}

/**
 * Handle number key shortcuts (1-6) for tool selection
 */
export const handleNumberKeys = (
  key: string,
  props: ShortcutHandlerProps
): boolean => {
  const { uiStateActions, scene } = props;

  switch (key) {
    case '1': {
      uiStateActions.setMode({
        type: 'CURSOR',
        showCursor: true,
        mousedownItem: null
      });
      return true;
    }
    case '2': {
      uiStateActions.setMode({
        type: 'PAN',
        showCursor: false
      });
      uiStateActions.setItemControls(null);
      return true;
    }
    case '3': {
      uiStateActions.setItemControls({
        type: 'ADD_ITEM'
      });
      uiStateActions.setMode({
        type: 'PLACE_ICON',
        showCursor: true,
        id: null
      });
      return true;
    }
    case '4': {
      uiStateActions.setMode({
        type: 'RECTANGLE.DRAW',
        showCursor: true,
        id: null
      });
      return true;
    }
    case '5': {
      uiStateActions.setMode({
        type: 'CONNECTOR',
        id: null,
        showCursor: true
      });
      return true;
    }
    case '6': {
      // We can't use useUiStateStore.getState() in a utility file
      // Instead, we'll use a default position and let the component handle positioning
      const textBoxId = generateId();
      const defaultPosition = { x: 5, y: 5 }; // Default position
      scene.createTextBox({
        ...TEXTBOX_DEFAULTS,
        id: textBoxId,
        tile: defaultPosition
      });
      uiStateActions.setMode({
        type: 'TEXTBOX',
        showCursor: false,
        id: textBoxId
      });
      return true;
    }
    default:
      return false;
  }
};

/**
 * Handle delete/backspace key for deleting selected items
 */
export const handleDeleteKey = (props: ShortcutHandlerProps): boolean => {
  const { itemControls, scene, uiStateActions } = props;

  if (itemControls) {
    // Delete the currently selected item
    switch (itemControls.type) {
      case 'ITEM':
        scene.deleteViewItem(itemControls.id);
        break;
      case 'CONNECTOR':
        scene.deleteConnector(itemControls.id);
        break;
      case 'TEXTBOX':
        scene.deleteTextBox(itemControls.id);
        break;
      case 'RECTANGLE':
        scene.deleteRectangle(itemControls.id);
        break;
      default:
        // Unknown item type, do nothing
        return false;
    }
    uiStateActions.setItemControls(null);
    return true;
  }
  return false;
};

/**
 * Handle undo (Ctrl+Z) shortcut
 */
export const handleUndo = (props: ShortcutHandlerProps): boolean => {
  const { historyActions, scene } = props;

  // Perform undo action
  const action = historyActions.undo();
  if (action) {
    console.log('Undo action performed:', action);
    // Apply the action using the applyAction function from useScene
    scene.applyAction(action);
    return true;
  }
  console.log('Nothing to undo');
  return false;
};

/**
 * Handle redo (Ctrl+Y) shortcut
 */
export const handleRedo = (props: ShortcutHandlerProps): boolean => {
  const { historyActions, scene } = props;

  // Perform redo action
  const action = historyActions.redo();
  if (action) {
    console.log('Redo action performed:', action);
    // Apply the action using the applyAction function from useScene
    scene.applyAction(action);
    return true;
  }
  console.log('Nothing to redo');
  return false;
};

/**
 * Handle copy (Ctrl+C) shortcut
 */
export const handleCopy = (props: ShortcutHandlerProps): boolean => {
  const { itemControls, scene, copiedItemRef } = props;

  if (itemControls) {
    switch (itemControls.type) {
      case 'ITEM': {
        const viewItem = scene.items.find((item) => {
          return item.id === itemControls.id;
        });
        if (viewItem) {
          copiedItemRef.current = {
            type: 'ITEM',
            data: { ...viewItem }
          };
          console.log('Copied view item');
          return true;
        }
        break;
      }
      case 'CONNECTOR': {
        const connector = scene.connectors.find((conn) => {
          return conn.id === itemControls.id;
        });
        if (connector) {
          copiedItemRef.current = {
            type: 'CONNECTOR',
            data: { ...connector }
          };
          console.log('Copied connector');
          return true;
        }
        break;
      }
      case 'TEXTBOX': {
        const textBox = scene.textBoxes.find((tb) => {
          return tb.id === itemControls.id;
        });
        if (textBox) {
          copiedItemRef.current = {
            type: 'TEXTBOX',
            data: { ...textBox }
          };
          console.log('Copied text box');
          return true;
        }
        break;
      }
      case 'RECTANGLE': {
        const rectangle = scene.rectangles.find((rect) => {
          return rect.id === itemControls.id;
        });
        if (rectangle) {
          copiedItemRef.current = {
            type: 'RECTANGLE',
            data: { ...rectangle }
          };
          console.log('Copied rectangle');
          return true;
        }
        break;
      }
      default:
        // Unknown item type, do nothing
        break;
    }
  }
  return false;
};

/**
 * Handle paste (Ctrl+V) shortcut
 */
export const handlePaste = (props: ShortcutHandlerProps): boolean => {
  const { scene, copiedItemRef } = props;

  if (copiedItemRef.current) {
    const { type, data } = copiedItemRef.current;
    const newId = generateId();
    // Apply a small offset to make the pasted item visible
    const offset = { x: 1, y: 0 };
    switch (type) {
      case 'ITEM': {
        scene.createViewItem({
          ...data,
          id: newId,
          tile: {
            x: data.tile.x + offset.x,
            y: data.tile.y + offset.y
          }
        });
        console.log('Pasted view item');
        return true;
      }
      case 'CONNECTOR': {
        scene.createConnector({
          ...data,
          id: newId,
          // For connectors, we need to adjust both from and to points
          from: {
            x: data.from.x + offset.x,
            y: data.from.y + offset.y
          },
          to: {
            x: data.to.x + offset.x,
            y: data.to.y + offset.y
          }
        });
        console.log('Pasted connector');
        return true;
      }
      case 'TEXTBOX': {
        scene.createTextBox({
          ...data,
          id: newId,
          tile: {
            x: data.tile.x + offset.x,
            y: data.tile.y + offset.y
          }
        });
        console.log('Pasted text box');
        return true;
      }
      case 'RECTANGLE': {
        scene.createRectangle({
          ...data,
          id: newId,
          from: {
            x: data.from.x + offset.x,
            y: data.from.y + offset.y
          },
          to: {
            x: data.to.x + offset.x,
            y: data.to.y + offset.y
          }
        });
        console.log('Pasted rectangle');
        return true;
      }
      default:
        // Unknown item type, do nothing
        break;
    }
  }
  return false;
};

/**
 * Main keyboard shortcut handler function
 */
export const handleKeyboardShortcut = (
  event: KeyboardEvent,
  props: ShortcutHandlerProps
): void => {
  const { editorMode } = props;

  // Only handle shortcuts in editable mode
  if (editorMode !== 'EDITABLE') return;

  // Prevent shortcuts when typing in input fields
  const target = event.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  switch (event.key) {
    // Number keys for tool selection (1-6)
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6': {
      event.preventDefault();
      handleNumberKeys(event.key, props);
      break;
    }

    case 'Delete':
    case 'Backspace': {
      event.preventDefault();
      handleDeleteKey(props);
      break;
    }

    case 'z':
    case 'Z': {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        handleUndo(props);
      }
      break;
    }

    case 'y':
    case 'Y': {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        handleRedo(props);
      }
      break;
    }

    case 'c':
    case 'C': {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        handleCopy(props);
      }
      break;
    }

    case 'v':
    case 'V': {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        handlePaste(props);
      }
      break;
    }

    default:
      // Other keys, do nothing
      break;
  }
};

interface UseKeyboardShortcutsProps {
  editorMode: keyof typeof EditorModeEnum;
  itemControls: ItemControls | null;
  scene: Scene;
  uiStateActions: Pick<UiStateActions, 'setMode' | 'setItemControls'>;
  historyActions: HistoryActions;
}

/**
 * Custom hook to handle keyboard shortcuts for the Isoflam editor
 */
export const useKeyboardShortcuts = ({
  editorMode,
  itemControls,
  scene,
  uiStateActions,
  historyActions
}: UseKeyboardShortcutsProps) => {
  // Store copied item data
  const copiedItemRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Use the handleKeyboardShortcut function from the shortcuts utility
      handleKeyboardShortcut(event, {
        editorMode,
        itemControls,
        scene,
        uiStateActions,
        historyActions,
        copiedItemRef
      });
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorMode, itemControls, scene, uiStateActions, historyActions]);
};

export default useKeyboardShortcuts;