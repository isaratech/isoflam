export const frTranslations = {
  // MainMenu
  'Main menu': 'Menu principal',
  Open: 'Ouvrir un JSON',
  'Export as JSON': 'Exporter en JSON',
  'Export as image': 'Exporter en image',
  'Share': 'Partager',
  'Clear the canvas': 'Effacer le canevas',
  GitHub: 'GitHub',
  Discord: 'Discord',
  
  // ShareDialog
  'Share Scene': 'Partager la scène',
  'Share your scene with others by copying this link:': 'Partagez votre scène avec d\'autres en copiant ce lien :',
  'Copy': 'Copier',
  'The scene is too large to share via URL. Try simplifying your scene.': 'La scène est trop volumineuse pour être partagée via URL. Essayez de simplifier votre scène.',
  'Failed to generate shareable URL': 'Échec de la génération de l\'URL de partage',
  'Failed to copy URL to clipboard': 'Échec de la copie de l\'URL dans le presse-papiers',
  'Link copied to clipboard': 'Lien copié dans le presse-papiers',
  'Anyone with this link can view and edit this scene. The link contains all scene data compressed into the URL.': 'Toute personne disposant de ce lien peut visualiser et modifier cette scène. Le lien contient toutes les données de la scène compressées dans l\'URL.',
  'Close': 'Fermer',

  // ToolMenu
  Select: 'Sélectionner',
  Pan: 'Déplacer',
  'Add item': 'Ajouter un élément',
  Rectangle: 'Rectangle',
  Connector: 'Connecteur',
  Text: 'Texte',

  // ZoomControls
  'Zoom out': 'Dézoomer',
  'Zoom in': 'Zoomer',
  'Fit to screen': "Ajuster à l'écran",

  // ExportImageDialog
  'Certain browsers may not support exporting images properly.':
    "Certains navigateurs peuvent ne pas prendre en charge l'exportation d'images correctement.",
  'For best results, please use the latest version of either Chrome or Firefox.':
    'Pour de meilleurs résultats, veuillez utiliser la dernière version de Chrome ou Firefox.',
  preview: 'aperçu',
  Options: 'Options',
  'Show grid': 'Afficher la grille',
  'Background color': "Couleur d'arrière-plan",
  'Current view': 'Vue actuelle',
  Cancel: 'Annuler',
  'Download as PNG': 'Télécharger en PNG',
  'Could not export image': "Impossible d'exporter l'image",

  // IconSelectionControls
  'You can drag and drop any item below onto the canvas.':
    "Vous pouvez glisser-déposer n'importe quel élément ci-dessous sur le canevas.",
  'Search icons': 'Rechercher des icônes',

  // DeleteButton
  Delete: 'Supprimer',

  // DuplicateButton
  Duplicate: 'Dupliquer',

  // NodeControls
  'Update icon': "Mettre à jour l'icône",
  Settings: 'Options supplémentaires',

  // TextBoxControls
  'Text size': 'Taille du texte',
  Alignment: 'Alignement',

  // NodeSettings
  Label: 'Libellé',
  Description: 'Description',
  'Label height': 'Hauteur du libellé',
  'Icon scale': "Taille de l'icône",

  // ColorSelector
  'No colors available': 'Aucune couleur disponible',

  // ConnectorControls
  Width: 'Largeur',
  Radius: 'Rayon',
  Style: 'Style',
  Triangle: 'Triangle',
  'Show triangle': 'Afficher le triangle',

  // Connector Styles
  SOLID: 'CONTINU',
  DOTTED: 'POINTILLÉ',
  DASHED: 'TIRETS',
    NONE: 'AUCUN',

  // ContextMenu
  'Send backward': 'Reculer',
  'Bring forward': 'Avancer',
  'Send to back': 'Mettre en arrière-plan',
  'Bring to front': 'Mettre au premier plan',
  'Create new icon': 'Créer une nouvelle icône',
  'Create new text': 'Créer un nouveau texte',
  'Create new rectangle': 'Créer un nouveau rectangle',
  'Create new link': 'Créer un nouveau lien',

  Mirroring: 'Miroir',
  Vertical: 'Vertical',
  Horizontal: 'Horizontal',

  // Credits Dialog
  Credits: 'Crédits',
  'SDMIS Icons': 'Icônes SDMIS',
  "Service Départemental-Métropolitain d'Incendie et de Secours (SDMIS), 2023. All rights reserved.":
    "Service Départemental-Métropolitain d'Incendie et de Secours (SDMIS), 2023. Tous droits réservés.",
  'Licensed under': 'Sous licence',
  'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)':
    "Creative Commons Attribution-Pas d'Utilisation Commerciale-Partage dans les Mêmes Conditions 4.0 International (CC BY-NC-SA 4.0)",

  // Subcategories
  equipment: 'Équipement',
  people: 'Personnes',
  vehicles: 'Véhicules',
  other: 'Autre',
  buildings: 'Bâtiments'
} as const;

export type TranslationKey = keyof typeof frTranslations;
