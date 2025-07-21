export const enTranslations = {
  // MainMenu
  'Main menu': 'Main menu',
  Open: 'Open JSON',
  'Export as JSON': 'Export as JSON',
  'Export as image': 'Export as image',
  'Clear the canvas': 'Clear the canvas',
  GitHub: 'GitHub',
  Discord: 'Discord',
  Language: 'Language',
  French: 'French',
  English: 'English',

  // ToolMenu
  Select: 'Select',
  Pan: 'Pan',
  'Add item': 'Add item',
  Rectangle: 'Rectangle',
    'Import Image': 'Import Image',
  Connector: 'Connector',
  Text: 'Text',

  // ZoomControls
  'Zoom out': 'Zoom out',
  'Zoom in': 'Zoom in',
  'Fit to screen': 'Fit to screen',

    // UndoRedoControls
    Undo: 'Undo',
    Redo: 'Redo',

    "Rotation": 'Rotation',
    "Rotate left 90°": 'Rotate left 90°',
    "Rotate right 90°": 'Rotate right 90°',

  // ExportImageDialog
  'Certain browsers may not support exporting images properly.':
    'Certain browsers may not support exporting images properly.',
  'For best results, please use the latest version of either Chrome or Firefox.':
    'For best results, please use the latest version of either Chrome or Firefox.',
  preview: 'preview',
  Options: 'Options',
  'Show grid': 'Show grid',
  'Background color': 'Background color',
  'Current view': 'Current view',
  Cancel: 'Cancel',
  'Download as PNG': 'Download as PNG',
  'Could not export image': 'Could not export image',

  // IconSelectionControls
  'You can drag and drop any item below onto the canvas.':
    'You can drag and drop any item below onto the canvas.',
  'Search icons': 'Search icons',

  // DeleteButton
  Delete: 'Delete',

  // DuplicateButton
  Duplicate: 'Duplicate',

  // NodeControls
  'Update icon': 'Update icon',
  Settings: 'Additional options',

  // TextBoxControls
  'Text size': 'Text size',
  Alignment: 'Alignment',
  'Text style': 'Text style',

  // NodeSettings
  Label: 'Label',
  Description: 'Description',
  'Label height': 'Label height',
  'Icon scale': 'Icon scale',
  'Reset to default size': 'Reset to default size',
    'Text formatting': 'Text formatting',

  // ColorSelector
  'No colors available': 'No colors available',

  // ConnectorControls
  Width: 'Width',
  Radius: 'Radius',
  Style: 'Style',
  Triangle: 'Triangle',
  'Show triangle': 'Show triangle',
    Layer: 'Layer',

  // Connector Styles
  SOLID: 'SOLID',
  DOTTED: 'DOTTED',
  DASHED: 'DASHED',
  NONE: 'NONE',

  // ContextMenu
  'Send backward': 'Send backward',
  'Bring forward': 'Bring forward',
  'Send to back': 'Send to back',
  'Bring to front': 'Bring to front',
  'Create new icon': 'Create new icon',
  'Create new text': 'Create new text',
  'Create new rectangle': 'Create new rectangle',
  'Create new link': 'Create new link',

  Mirroring: 'Mirroring',
  Vertical: 'Vertical',
  Horizontal: 'Horizontal',

  // Credits Dialog
  Credits: 'Credits',
  'SDMIS Icons': 'SDMIS Icons',
  "Service Départemental-Métropolitain d'Incendie et de Secours (SDMIS), 2023. All rights reserved.":
    "Service Départemental-Métropolitain d'Incendie et de Secours (SDMIS), 2023. All rights reserved.",
  'Licensed under': 'Licensed under',
  'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)':
    'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',

  // Subcategories
  equipment: 'Equipment',
  people: 'People',
  vehicles: 'Vehicles',
  other: 'Other',
    buildings: 'Buildings',

    // Unsaved changes warning
    'Your unsaved changes will be lost': 'Your unsaved changes will be lost'
} as const;

export type TranslationKey = keyof typeof enTranslations;
