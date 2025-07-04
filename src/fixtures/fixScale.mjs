//  fix-scale.mjs  (Node ≥ 14)
import { readFileSync, writeFileSync } from 'fs';

// 1. charge le fichier d’origine
const original = readFileSync('./sdmisIcons.ts', 'utf8');

// 2. fonction de remplacement sur chaque bloc d’objet
const fixed = original.replace(
  /({[^}]*?("id":\s*"(?:[^"]*_(?:vehicules|vehicul)_)[^"]*")[^}]*?"scaleFactor":\s*)1([^}]*})/gs,
  (_, prefix, idPart, suffix) => `${prefix}1.5${suffix}`
);

// 3. écrit le fichier corrigé
writeFileSync('./sdmisIcons.fixed.ts', fixed, 'utf8');
console.log('✅  Fichier généré : sdmisIcons.fixed.ts');
